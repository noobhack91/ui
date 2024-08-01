import React, { useState, useEffect } from 'react';
import { useRetrospectiveEntryService } from '../services/retrospectiveEntryService';
import { appService } from '../services/appService';
import { useTranslation } from 'react-i18next';
import { Order, OrderTemplate, Concept, ConceptClass } from '../domain/order';
import { Bahmni } from '../utils/bahmni';
import { ngDialog } from 'ng-dialog'; // Assuming ngDialog is available as a React component or hook

interface OrderControllerProps {
    consultation: any;
    allOrderables: OrderTemplate[];
}

const OrderController: React.FC<OrderControllerProps> = ({ consultation, allOrderables }) => {
    const { t } = useTranslation();
    const { getRetrospectiveEntry } = useRetrospectiveEntryService();
    const [orders, setOrders] = useState<Order[]>(consultation.orders || []);
    const [childOrders, setChildOrders] = useState<Order[]>(consultation.childOrders || []);
    const [allOrdersTemplates, setAllOrdersTemplates] = useState<OrderTemplate[]>(allOrderables);
    const [activeTab, setActiveTab] = useState<any>(null);
    const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
    const [hideLabTests, setHideLabTests] = useState<boolean>(true);
    const [orderNoteText, setOrderNoteText] = useState<string>('');
    const [dialog, setDialog] = useState<any>(null);

    const RadiologyOrderOptionsConfig = appService.getAppDescriptor().getConfig("enableRadiologyOrderOptions");
    const LabOrderOptionsConfig = appService.getAppDescriptor().getConfig("enableLabOrderOptions");
    const enableRadiologyOrderOptions = RadiologyOrderOptionsConfig ? RadiologyOrderOptionsConfig.value : null;
    const enableLabOrderOptions = LabOrderOptionsConfig ? LabOrderOptionsConfig.value : null;
    const testConceptToParentsMapping: { [key: string]: string[] } = {}; // A child concept could be part of multiple parent panels

    useEffect(() => {
        init();
    }, []);

    const collapseExistingActiveSection = (section: any) => {
        if (section) {
            section.klass = "";
        }
    };

    const toggleLabTests = () => {
        setHideLabTests(!hideLabTests);
    };

    const showFirstLeftCategoryByDefault = () => {
        if (!activeTab?.leftCategory) {
            const allLeftCategories = getOrderTemplate(activeTab.name).setMembers;
            if (allLeftCategories.length > 0) {
                showLeftCategoryTests(allLeftCategories[0]);
            }
        }
    };

    const findTest = (testUuid: string): Concept | undefined => {
        let test;
        const allLeftCategories = getOrderTemplate(activeTab.name).setMembers;
        allLeftCategories.forEach((leftCategory: any) => {
            const foundTest = leftCategory.setMembers.find((test: Concept) => test.uuid === testUuid);
            if (foundTest) {
                test = foundTest;
                return;
            }
        });
        return test;
    };

    const removeOrder = (testUuid: string) => {
        const order = orders.find(order => order.concept.uuid === testUuid);
        if (order) {
            if (order.uuid) {
                order.isDiscontinued = true;
                // $state.orderRemoved = true; // SECOND AGENT: [MISSING CONTEXT] - Handle state change
            } else {
                setOrders(orders.filter(o => o !== order));
            }
        }
    };

    const createOrder = (test: Concept) => {
        const discontinuedOrder = orders.find(order => (test.uuid === order.concept.uuid) && order.isDiscontinued);
        if (discontinuedOrder) {
            discontinuedOrder.isDiscontinued = false;
        } else {
            const createdOrder = Bahmni.Clinical.Order.create(test);
            setOrders([...orders, createdOrder]);
            // $state.orderCreated = true; // SECOND AGENT: [MISSING CONTEXT] - Handle state change
        }
    };

    const initTestConceptToParentsMapping = () => {
        const allLeftCategories = getOrderTemplate(activeTab.name).setMembers;
        allLeftCategories.forEach((leftCategory: any) => {
            leftCategory.setMembers.forEach((member: any) => {
                if (member.setMembers.length !== 0) {
                    member.setMembers.forEach((child: any) => {
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
        const tabs: any[] = [];
        allOrderables.forEach(item => {
            const conceptName = getName(item);
            const tabName = conceptName || item.name.name;
            const key = `'${tabName}'`;
            allOrdersTemplates[key] = filterOrderTemplateByClassMap(item);
            tabs.push({ name: tabName, topLevelConcept: item.name.name });
        });
        if (tabs.length > 0) {
            activateTab(tabs[0]);
            initTestConceptToParentsMapping();
        }
    };

    const isRetrospectiveMode = () => {
        return !_.isEmpty(getRetrospectiveEntry());
    };

    const activateTab = (tab: any) => {
        if (tab.klass === "active") {
            tab.klass = "";
            setActiveTab(undefined);
        } else {
            collapseExistingActiveSection(activeTab);
            setActiveTab(tab);
            tab.klass = "active";
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
        setSelectedOrders(orders.filter(testOrder => activeTabTestConcepts.includes(testOrder.concept.uuid)));

        selectedOrders.forEach(order => {
            order.isUrgent = order.urgency === "STAT" ? true : order.isUrgent;
        });
    };

    const getOrderTemplate = (templateName: string) => {
        const key = `'${templateName}'`;
        return allOrdersTemplates[key];
    };

    const filterOrderTemplateByClassMap = (orderTemplate: OrderTemplate) => {
        const orderTypeClassMapConfig = appService.getAppDescriptor().getConfig("orderTypeClassMap");
        const orderTypeClassMap = orderTypeClassMapConfig ? orderTypeClassMapConfig.value : {};
        const orderTypeName = getNameInDefaultLocale(orderTemplate);

        if (orderTypeClassMap[orderTypeName]) {
            const orderClasses = orderTypeClassMap[orderTypeName];
            const filteredOrderTemplate = { ...orderTemplate };

            filteredOrderTemplate.setMembers = filteredOrderTemplate.setMembers.map(category => {
                category.setMembers = category.setMembers.filter(test => orderClasses.includes(test.conceptClass.name));
                return category;
            });

            return filteredOrderTemplate;
        }

        return orderTemplate;
    };

    const showLeftCategoryTests = (leftCategory: any) => {
        collapseExistingActiveSection(activeTab.leftCategory);
        activeTab.leftCategory = leftCategory;
        activeTab.leftCategory.klass = "active";
        activeTab.leftCategory.groups = getConceptClassesInSet(leftCategory);
    };

    const getConceptClassesInSet = (conceptSet: any) => {
        const conceptsWithUniqueClass = _.uniqBy(conceptSet ? conceptSet.setMembers : [], (concept: Concept) => concept.conceptClass.uuid);
        let conceptClasses: ConceptClass[] = [];
        conceptsWithUniqueClass.forEach(concept => {
            conceptClasses.push({ name: concept.conceptClass.name, description: concept.conceptClass.description });
        });
        conceptClasses = _.sortBy(conceptClasses, 'name');
        return conceptClasses;
    };

    const handleOrderClick = (order: Order) => {
        const test = findTest(order.concept.uuid);
        if (test) {
            toggleOrderSelection(test);
        }
    };

    const resetSearchString = () => {

        setSearch({ ...search, string: '' });
    };

    const toggleOrderSelection = (test: Concept) => {
        resetSearchString();
        const orderPresent = isActiveOrderPresent(test);
        if (!orderPresent) {
            createOrder(test);
            test.setMembers.forEach(child => {
                removeOrder(child.uuid);
            });
        } else {
            removeOrder(test.uuid);
        }
    };

    const isActiveOrderPresent = (test: Concept) => {
        const validOrders = orders.filter(testOrder => !testOrder.isDiscontinued);
        return validOrders.some(order => (order.concept.uuid === test.uuid) || testConceptToParentsMapping[test.uuid]?.includes(order.concept.uuid));
    };

    const isOrderNotEditable = (order: Order) => {
        const test = findTest(order.concept.uuid);
        return test ? isTestIndirectlyPresent(test) : false;
    };

    const isTestIndirectlyPresent = (test: Concept) => {
        const validOrders = orders.filter(testOrder => !testOrder.isDiscontinued);
        return validOrders.some(order => testConceptToParentsMapping[test.uuid]?.includes(order.concept.uuid));
    };

    const openNotesPopup = (order: Order) => {
        order.previousNote = order.commentToFulfiller;
        setOrderNoteText(order.previousNote);
        setDialog(ngDialog.open({ template: 'consultation/views/orderNotes.html', className: 'selectedOrderNoteContainer-dialog ngdialog-theme-default', data: order }));
    };

    const appendPrintNotes = (order: Order) => {
        const printNotes = t("CLINICAL_ORDER_RADIOLOGY_NEED_PRINT");
        if (order.previousNote && !order.previousNote.includes(printNotes)) {
            setOrderNoteText(printNotes + (order.previousNote || ''));
        } else if (!orderNoteText.includes(printNotes)) {
            setOrderNoteText(printNotes + (orderNoteText || ''));
        }
    };

    const isPrintShown = (isOrderSaved: boolean) => {
        const configuredOptions = getConfiguredOptions();
        return configuredOptions.some(option => option.toLowerCase() === 'needsprint') && !isOrderSaved;
    };

    const isUrgent = () => {
        const configuredOptions = getConfiguredOptions();
        return configuredOptions.some(option => option.toLowerCase() === 'urgent');
    };

    const getConfiguredOptions = () => {
        let configuredOptions = null;
        if (activeTab.name === 'Radiology') {
            configuredOptions = enableRadiologyOrderOptions;
        } else {
            configuredOptions = enableLabOrderOptions;
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
        ngDialog.close();
    };

    const getName = (sample: any) => {
        const name = sample.names.find((name: any) => name.conceptNameType === "SHORT") || sample.names.find((name: any) => name.conceptNameType === "FULLY_SPECIFIED");
        return name && name.name;
    };

    const getNameInDefaultLocale = (sample: any) => {
        const name = sample.names.find((name: any) => name.conceptNameType === "FULLY_SPECIFIED" && name.locale === (localStorage.getItem("openmrsDefaultLocale") || "en"));
        return name ? name.name : sample.name.name;
    };

    return (

            <div className="tabs">
                {allOrderables.map((item, index) => (
                    <button
                        key={index}
                        className={activeTab?.name === getName(item) ? "active" : ""}
                        onClick={() => activateTab({ name: getName(item), topLevelConcept: item.name.name })}
                    >
                        {getName(item)}
                    </button>
                ))}
            </div>
            {activeTab && (
                <div className="order-section">
                    <div className="left-category">
                        {getOrderTemplate(activeTab.name).setMembers.map((leftCategory, index) => (
                            <button
                                key={index}
                                className={activeTab.leftCategory?.name === leftCategory.name ? "active" : ""}
                                onClick={() => showLeftCategoryTests(leftCategory)}
                            >
                                {leftCategory.name}
                            </button>
                        ))}
                    </div>
                    <div className="right-category">
                        {activeTab.leftCategory && (
                    
                                {activeTab.leftCategory.groups.map((group, index) => (
                                    <div key={index} className="group">
                                        <h4>{group.name}</h4>
                                        {activeTab.leftCategory.setMembers
                                            .filter(test => test.conceptClass.name === group.name)
                                            .map((test, index) => (
                                                <div key={index} className="test">
                                                    <input
                                                        type="checkbox"
                                                        checked={isActiveOrderPresent(test)}
                                                        onChange={() => toggleOrderSelection(test)}
                                                    />
                                                    <label>{test.name}</label>
                                                </div>
                                            ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
            {selectedOrders.length > 0 && (
                <div className="selected-orders">
                    <h3>{t('Selected Orders')}</h3>
                    {selectedOrders.map((order, index) => (
                        <div key={index} className="order">
                            <span>{order.concept.name}</span>
                            <button onClick={() => openNotesPopup(order)}>{t('Add Notes')}</button>
                            <button onClick={() => removeOrder(order.concept.uuid)}>{t('Remove')}</button>
                        </div>
                    ))}
                </div>
            )}
            {dialog && (
                <dialog open>
                    <textarea
                        value={orderNoteText}
                        onChange={(e) => setOrderNoteText(e.target.value)}
                    />
                    <button onClick={() => setEditedFlag(dialog.data, orderNoteText)}>{t('Save')}</button>
                    <button onClick={closePopup}>{t('Close')}</button>
                </dialog>
            )}
        </div>

        <div className="tabs">
            {allOrderables.map((item, index) => (
                <button
                    key={index}
                    className={activeTab?.name === getName(item) ? "active" : ""}
                    onClick={() => activateTab({ name: getName(item), topLevelConcept: item.name.name })}
                >
                    {getName(item)}
                </button>
            ))}

        {activeTab && (
            <div className="order-section">
                <div className="left-category">
                    {getOrderTemplate(activeTab.name).setMembers.map((leftCategory, index) => (
                        <button
                            key={index}
                            className={activeTab.leftCategory?.name === leftCategory.name ? "active" : ""}
                            onClick={() => showLeftCategoryTests(leftCategory)}
                        >
                            {leftCategory.name}
                        </button>
                    ))}
        
                <div className="right-category">
                    {activeTab.leftCategory && (
                        <div>
                            {activeTab.leftCategory.groups.map((group, index) => (
                                <div key={index} className="group">
                                    <h4>{group.name}</h4>
                                    {activeTab.leftCategory.setMembers
                                        .filter(test => test.conceptClass.name === group.name)
                                        .map((test, index) => (
                                            <div key={index} className="test">
                                                <input
                                                    type="checkbox"
                                                    checked={isActiveOrderPresent(test)}
                                                    onChange={() => toggleOrderSelection(test)}
                                                />
                                                <label>{test.name}</label>
                                    
                                        ))}
                        
                            ))}
                
                    )}
        
    
        )}
        {selectedOrders.length > 0 && (
            <div className="selected-orders">
                <h3>{t('Selected Orders')}</h3>
                {selectedOrders.map((order, index) => (
                    <div key={index} className="order">
                        <span>{order.concept.name}</span>
                        <button onClick={() => openNotesPopup(order)}>{t('Add Notes')}</button>
                        <button onClick={() => removeOrder(order.concept.uuid)}>{t('Remove')}</button>
            
                ))}
    
        )}
        {dialog && (
            <dialog open>
                <textarea
                    value={orderNoteText}
                    onChange={(e) => setOrderNoteText(e.target.value)}
                />
                <button onClick={() => setEditedFlag(dialog.data, orderNoteText)}>{t('Save')}</button>
                <button onClick={closePopup}>{t('Close')}</button>
            </dialog>
        )}
    );
};

export default OrderController;
