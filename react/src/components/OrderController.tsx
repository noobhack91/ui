import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog } from 'react-bootstrap';
import _ from 'lodash';
import { Bahmni } from 'bahmni';
import { appService } from 'services/appService';
import { retrospectiveEntryService } from 'services/retrospectiveEntryService';

interface Order {
    concept: { uuid: string };
    uuid?: string;
    isDiscontinued?: boolean;
    urgency?: string;
    isUrgent?: boolean;
    commentToFulfiller?: string;
    previousNote?: string;
    hasBeenModified?: boolean;
}

interface OrderTemplate {
    name: { name: string };
    setMembers: OrderTemplate[];
}

interface Tab {
    name: string;
    topLevelConcept: string;
    klass?: string;
    leftCategory?: OrderTemplate;
}

interface OrderControllerProps {
    consultation: {
        orders: Order[];
        childOrders: Order[];
    };
    allOrderables: OrderTemplate[];
}

const OrderController: React.FC<OrderControllerProps> = ({ consultation, allOrderables }) => {
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTab, setActiveTab] = useState<Tab | undefined>(undefined);
    const [hideLabTests, setHideLabTests] = useState(true);
    const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
    const [orderNoteText, setOrderNoteText] = useState<string>('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const { t } = useTranslation();

    const testConceptToParentsMapping: { [key: string]: string[] } = {};

    useEffect(() => {
        init();
    }, []);

    useEffect(() => {
        updateSelectedOrdersForActiveTab();
    }, [consultation.orders, activeTab]);

    const collapseExistingActiveSection = (section: Tab | undefined) => {
        if (section) {
            section.klass = '';
        }
    };

    const toggleLabTests = () => {
        setHideLabTests(!hideLabTests);
    };

    const showFirstLeftCategoryByDefault = () => {
        if (!activeTab?.leftCategory) {
            const allLeftCategories = getOrderTemplate(activeTab?.name).setMembers;
            if (allLeftCategories.length > 0) {
                showLeftCategoryTests(allLeftCategories[0]);
            }
        }
    };

    const findTest = (testUuid: string) => {
        let test;
        const allLeftCategories = getOrderTemplate(activeTab?.name).setMembers;
        _.each(allLeftCategories, (leftCategory) => {
            const foundTest = _.find(leftCategory.setMembers, (test) => test.uuid === testUuid);
            if (foundTest) {
                test = foundTest;
                return;
            }
        });
        return test;
    };

    const removeOrder = (testUuid: string) => {
        const order = _.find(consultation.orders, (order) => order.concept.uuid === testUuid);
        if (order) {
            if (order.uuid) {
                order.isDiscontinued = true;
                // $state.orderRemoved = true; // SECOND AGENT: [MISSING CONTEXT] - Need to handle state management for orderRemoved
            } else {
                _.remove(consultation.orders, order);
            }
        }
    };

    const createOrder = (test: OrderTemplate) => {
        const discontinuedOrder = _.find(consultation.orders, (order) => test.uuid === order.concept.uuid && order.isDiscontinued);
        if (discontinuedOrder) {
            discontinuedOrder.isDiscontinued = false;
        } else {
            const createdOrder = Bahmni.Clinical.Order.create(test);
            consultation.orders.push(createdOrder);
            // $state.orderCreated = true; // SECOND AGENT: [MISSING CONTEXT] - Need to handle state management for orderCreated
        }
    };

    const initTestConceptToParentsMapping = () => {
        const allLeftCategories = getOrderTemplate(activeTab?.name).setMembers;
        _.each(allLeftCategories, (leftCategory) => {
            _.each(leftCategory.setMembers, (member) => {
                if (member.setMembers.length !== 0) {
                    _.each(member.setMembers, (child) => {
                        if (testConceptToParentsMapping[child.uuid] === undefined) {
                            testConceptToParentsMapping[child.uuid] = [];
                        }
                        testConceptToParentsMapping[child.uuid].push(member.uuid);
                    });
                }
            });
        });
    };

    const init = () => {
        const tabs: Tab[] = [];
        _.forEach(allOrderables, (item) => {
            const conceptName = getName(item);
            const tabName = conceptName || item.name.name;
            const key = `'${tabName}'`;
            allOrderables[key] = filterOrderTemplateByClassMap(item);
            tabs.push({ name: tabName, topLevelConcept: item.name.name });
        });
        if (tabs.length > 0) {
            activateTab(tabs[0]);
            initTestConceptToParentsMapping();
        }
        setTabs(tabs);
    };

    const isRetrospectiveMode = () => {
        return !_.isEmpty(retrospectiveEntryService.getRetrospectiveEntry());
    };

    const activateTab = (tab: Tab) => {
        if (tab.klass === 'active') {
            tab.klass = '';
            setActiveTab(undefined);
        } else {
            collapseExistingActiveSection(activeTab);
            setActiveTab(tab);
            tab.klass = 'active';
            updateSelectedOrdersForActiveTab();
            initTestConceptToParentsMapping();
            showFirstLeftCategoryByDefault();
        }
    };

    const updateSelectedOrdersForActiveTab = () => {
        if (!activeTab) {
            return;
        }
        const activeTabTestConcepts = _.map(_.flatten(_.map(getOrderTemplate(activeTab.name).setMembers, 'setMembers')), 'uuid');
        const selectedOrders = _.filter(consultation.orders, (testOrder) => _.indexOf(activeTabTestConcepts, testOrder.concept.uuid) !== -1);

        _.each(selectedOrders, (order) => {
            order.isUrgent = order.urgency === 'STAT' ? true : order.isUrgent;
        });

        setSelectedOrders(selectedOrders);
    };

    const getOrderTemplate = (templateName: string) => {
        const key = `'${templateName}'`;
        return allOrderables[key];
    };

    const filterOrderTemplateByClassMap = (orderTemplate: OrderTemplate) => {
        const orderTypeClassMapConfig = appService.getAppDescriptor().getConfig('orderTypeClassMap');
        const orderTypeClassMap = orderTypeClassMapConfig ? orderTypeClassMapConfig.value : {};
        const orderTypeName = getNameInDefaultLocale(orderTemplate);

        if (orderTypeClassMap[orderTypeName]) {
            const orderClasses = orderTypeClassMap[orderTypeName];
            const filteredOrderTemplate = _.cloneDeep(orderTemplate);

            filteredOrderTemplate.setMembers = filteredOrderTemplate.setMembers.map((category) => {
                category.setMembers = category.setMembers.filter((test) => orderClasses.includes(test.conceptClass.name));
                return category;
            });

            return filteredOrderTemplate;
        }

        return orderTemplate;
    };

    const showLeftCategoryTests = (leftCategory: OrderTemplate) => {
        collapseExistingActiveSection(activeTab?.leftCategory);
        if (activeTab) {
            activeTab.leftCategory = leftCategory;
            activeTab.leftCategory.klass = 'active';
            activeTab.leftCategory.groups = getConceptClassesInSet(leftCategory);
        }
    };

    const getConceptClassesInSet = (conceptSet: OrderTemplate) => {
        const conceptsWithUniqueClass = _.uniqBy(conceptSet ? conceptSet.setMembers : [], (concept) => concept.conceptClass.uuid);
        const conceptClasses = [];
        _.forEach(conceptsWithUniqueClass, (concept) => {
            conceptClasses.push({ name: concept.conceptClass.name, description: concept.conceptClass.description });
        });
        return _.sortBy(conceptClasses, 'name');
    };

    const handleOrderClick = (order: Order) => {
        const test = findTest(order.concept.uuid);
        toggleOrderSelection(test);
    };

    const resetSearchString = () => {

        setSearch({ ...search, string: '' });
    };

    const toggleOrderSelection = (test: OrderTemplate) => {
        resetSearchString();
        const orderPresent = isActiveOrderPresent(test);
        if (!orderPresent) {
            createOrder(test);
            _.each(test.setMembers, (child) => {
                removeOrder(child.uuid);
            });
        } else {
            removeOrder(test.uuid);
        }
    };

    const isActiveOrderPresent = (test: OrderTemplate) => {
        const validOrders = _.filter(consultation.orders, (testOrder) => !testOrder.isDiscontinued);
        return _.find(validOrders, (order) => order.concept.uuid === test.uuid || _.includes(testConceptToParentsMapping[test.uuid], order.concept.uuid));
    };

    const isOrderNotEditable = (order: Order) => {
        const test = findTest(order.concept.uuid);
        return isTestIndirectlyPresent(test);
    };

    const isTestIndirectlyPresent = (test: OrderTemplate) => {
        const validOrders = _.filter(consultation.orders, (testOrder) => !testOrder.isDiscontinued);
        return _.find(validOrders, (order) => _.includes(testConceptToParentsMapping[test.uuid], order.concept.uuid));
    };

    const openNotesPopup = (order: Order) => {
        order.previousNote = order.commentToFulfiller;
        setOrderNoteText(order.previousNote || '');
        setDialogOpen(true);
    };

    const appendPrintNotes = (order: Order) => {
        const printNotes = t('CLINICAL_ORDER_RADIOLOGY_NEED_PRINT');
        if (order.previousNote && order.previousNote.indexOf(printNotes) === -1) {
            setOrderNoteText(printNotes + (order.previousNote || ''));
        } else if ((orderNoteText || '').indexOf(printNotes) === -1) {
            setOrderNoteText(t(printNotes) + (orderNoteText || ''));
        }
    };

    const isPrintShown = (isOrderSaved: boolean) => {
        const configuredOptions = getConfiguredOptions();
        return _.some(configuredOptions, (option) => option.toLowerCase() === 'needsprint') && !isOrderSaved;
    };

    const isUrgent = () => {
        const configuredOptions = getConfiguredOptions();
        return _.some(configuredOptions, (option) => option.toLowerCase() === 'urgent');
    };

    const getConfiguredOptions = () => {
        let configuredOptions = null;
        if (activeTab?.name === 'Radiology') {
            configuredOptions = appService.getAppDescriptor().getConfig('enableRadiologyOrderOptions');
        } else {
            configuredOptions = appService.getAppDescriptor().getConfig('enableLabOrderOptions');
        }
        return configuredOptions;
    };

    const setEditedFlag = (order: Order, orderNoteText: string) => {
        if (order.previousNote !== orderNoteText) {
            order.commentToFulfiller = orderNoteText;
            order.hasBeenModified = true;
        }
        closePopup();
    };

    const closePopup = () => {
        setDialogOpen(false);
    };

    const getName = (sample: OrderTemplate) => {
        const name = _.find(sample.names, { conceptNameType: 'SHORT' }) || _.find(sample.names, { conceptNameType: 'FULLY_SPECIFIED' });
        return name && name.name;
    };

    const getNameInDefaultLocale = (sample: OrderTemplate) => {
        const name = _.find(sample.names, { conceptNameType: 'FULLY_SPECIFIED', locale: localStorage.getItem('openmrsDefaultLocale') || 'en' });
        return name ? name.name : sample.name.name;
    };

    return (
        <div>

            <div>
                <div className="tabs">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            className={tab.klass}
                            onClick={() => activateTab(tab)}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
                <div className="orders">
                    {selectedOrders.map((order, index) => (
                        <div key={index} className="order">
                            <span>{order.concept.uuid}</span>
                            <button onClick={() => handleOrderClick(order)}>
                                {order.isDiscontinued ? 'Reinstate' : 'Discontinue'}
                            </button>
                            <button onClick={() => openNotesPopup(order)}>
                                Notes
                            </button>
                        </div>
                    ))}
                </div>
                {dialogOpen && (
                    <Dialog onHide={closePopup}>
                        <Dialog.Header closeButton>
                            <Dialog.Title>Order Notes</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <textarea
                                value={orderNoteText}
                                onChange={(e) => setOrderNoteText(e.target.value)}
                            />
                        </Dialog.Body>
                        <Dialog.Footer>
                            <button onClick={closePopup}>Close</button>
                            <button onClick={() => setEditedFlag(selectedOrders[0], orderNoteText)}>
                                Save
                            </button>
                        </Dialog.Footer>
                    </Dialog>
                )}
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    value={search.string}
                    onChange={(e) => setSearch({ ...search, string: e.target.value })}
                    placeholder="Search orders..."
                />
                <button onClick={resetSearchString}>Reset</button>

            <div className="lab-tests-toggle">
                <button onClick={toggleLabTests}>
                    {hideLabTests ? 'Show Lab Tests' : 'Hide Lab Tests'}
                </button>

            <div className="left-category-tests">
                {activeTab?.leftCategory && (
                    <div>
                        <h3>{activeTab.leftCategory.name.name}</h3>
                        <ul>
                            {activeTab.leftCategory.setMembers.map((test, index) => (
                                <li key={index} onClick={() => toggleOrderSelection(test)}>
                                    {test.name.name}
                                </li>
                            ))}
                        </ul>
        
                )}
    );
};

export default OrderController;
