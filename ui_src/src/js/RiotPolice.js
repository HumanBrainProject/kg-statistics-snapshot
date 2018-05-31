/*
*   Copyright (c) 2018, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

const RiotPolice = {
    _stores: {},

    registerStore: function(store) {
        if(!(store instanceof RiotStore)){
            console.log(store);
            throw "Registered Store must be instances of RiotStore";
        }

        if(this._stores[store.name] != undefined){
            throw "A store is already registered with that name : ${store.name}";
        }

        this._stores[store.name] = {
            storeObject: store,
            registeredComponents: []
        };
    },

    requestStore: function(storeName, component, initOptions){
        const store = this._stores[storeName],
              self = this;

        if(store === undefined){
            throw "Tried to request a store ${storeName} that has not been previously registered";
        }

        const componentIndex = store.registeredComponents.indexOf(component)
        if (componentIndex != -1) {
            throw 'Given component already registered the store "'+storeName+'"';
        }

        // Store is not registered with any components, we map its actions to event listeners
        if(store.registeredComponents.length <= 0){
            Object.keys(store.storeObject.actions).forEach(action => this.on(action, store.storeObject.actions[action]))
        }

        store.registeredComponents.push(component);

        component.stores = component.stores || {};
        component.stores[storeName] = store.storeObject.interfaces;

        store.storeObject.init(initOptions);
    },

    releaseStore: function(storeName, component) {
        const store = this._stores[storeName]

        if (store === undefined) {
            throw 'Can\'t release unknown store "'+storeName+'"'
        }

        // Remove the component <> store registration link
        const componentIndex = store.registeredComponents.indexOf(component)
        if (componentIndex === -1) {
            throw 'Tried to release non registered component on store "'+storeName+'"';
        }
        store.registeredComponents.splice(componentIndex, 1);

        // The store is not registered anymore with any component
        if (store.registeredComponents.length <= 0) {
            Object.keys(store.storeObject.actions).forEach(action => this.on(action, store.storeObject.actions[action]))

            store.storeObject.reset();
        }

        delete component.stores[storeName];
    }
};

riot.observable(RiotPolice);