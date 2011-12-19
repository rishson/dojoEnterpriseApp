define([
    "dojo/_base/declare",
    "rishson/widget/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/_base/lang",
    "dojo/_base/array", // forEach
    "dojo/on", // for event delegation
    "dojo/dom", // for byId
    "dojo/dom-construct", // for create, place, destroy
    "dojo/currency", // for formatting currency based on locale
    "dojo/date/locale", // for formatting dates based on locale
    "dojo/date/stamp", // for serialization between Date and ISO 8601 string
    "dojo/text!./resources/Wishlist.html", // widget template
    "dojo/i18n!./nls/Wishlist", // widget i18n bundle
    // widgets used in template, not referenced directly in module
    "dijit/form/ValidationTextBox",
    "dijit/form/CurrencyTextBox"
], function(declare, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin,
        lang, arrayUtil, on, dom, domConstruct, currency, dateLocale, dateStamp,
        template, l10n){
    
    var Wishlist = declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The Wishlist widget displays a table of items displaying name,
        //      price, and when each item was added.  It expects a store with
        //      query observation support for automatically reflecting changes.
        
        baseClass: "widgetExampleWishlist",
        templateString: template,
        l10n: l10n,
        
        // store: dojo.store
        // Store in which to hold added items.
        store: null,
        
        // query: Object
        // Filter to apply when querying the store for items to display.
        query: null,

        constructor: function(args){
            if (!args.store) {
                throw new Error("WishList requires a store instance to hold items.");
            }
            
            // Initialize query to blank object on instance.
            // If passed in args, this will be overwritten.
            this.query = {};
        },

        postCreate: function(){
            var self = this;
            
            this.inherited(arguments);
            
            // set up delegated event handler for remove/add button clicks
            on(this.tableNode, "button:click", function(evt){
                // call _clickHandler on instance, passing clicked button
                self._clickHandler(this);
            });
            
            // set up delegated event handler for sort control changes
            // TODO: click for old IE?
            on(this.sortNode, "input:change", lang.hitch(this, "_doQuery"));
            
            // create array referencing radio buttons for getSortOptions
            this.sortRadios = [
                this.sortNameRadio, this.sortPriceRadio, this.sortDateRadio
            ];
            
            // run initial query
            this._doQuery();
        },

        startup: function(){
            if(this._started){ return; }
            
            this.inherited(arguments);
        },
        
        _doQuery: function(){
            // summary:
            //      Performs a query and (re)populates the table body.
            
            var results = this.store.query(this.query, {
                    sort: this._getSortOptions()
                }),
                self = this;/*,
                rows = this.tbodyNode.getElementsByTagName("tr"),
                // rows array is live, so cache length once for loop
                numRows = rows.length;*/
            
            // remove existing rows before populating
            domConstruct.empty(this.tbodyNode);
            
            results.forEach(function(item, index){
                // reuse _observeHandler's logic by simulating an item addition
                self._observeHandler(item, -1, index);
            });
            
            // unhook any existing observer before setting up new one
            if (this._observer) { this._observer.cancel(); }
            if (results.observe) {
                this._observer = results.observe(
                    lang.hitch(this, "_observeHandler"), true);
            }
            
            return results; // promise or Array
        },
        
        _getSortOptions: function(){
            // summary:
            //      Retrieves sort options based on state of inputs
            
            var descending = this.descendingCheck.checked,
                // find checked radio button; its value is the field to sort by
                attribute = arrayUtil.filter(this.sortRadios, function(input){
                    return input.checked;
                })[0].value;
            
            // queryOptions.sort takes an array of attributes
            return [{ attribute: attribute, descending: descending }];
        },
        
        _getRowId: function(item){
            // summary:
            //      Generates a determinstic id for a tr in the tbody.
            return this.id + "_row_" + this.store.getIdentity(item);
        },
        
        _observeHandler: function(item, from, to){
            // summary:
            //      Handler called when a store item is added/removed/modified.
            var rowId = this._getRowId(item),
                row, cell;
            
            if (from > -1) { // remove
                row = dom.byId(rowId);
                row && domConstruct.destroy(row);
            }
            if (to > -1) { // add
                row = domConstruct.create("tr", {
                    id: rowId
                });
                
                // add cells with item fields as text
                cell = domConstruct.create("td", {}, row);
                cell.appendChild(document.createTextNode(item.name));
                
                cell = domConstruct.create("td", {}, row);
                cell.appendChild(document.createTextNode(
                    currency.format(item.price)));
                
                cell = domConstruct.create("td", {}, row);
                cell.appendChild(document.createTextNode(
                    dateLocale.format(dateStamp.fromISOString(item.date))));
                
                // add cell containing remove button
                cell = domConstruct.create("td", null, row);
                domConstruct.create("button", {
                    // give a deterministic id for tracing back to item id
                    id: "remove_" + rowId,
                    innerHTML: l10n.Remove,
                    type: "button"
                }, cell);
                
                // insert row into table at appropriate position
                domConstruct.place(row, this.tbodyNode, to);
            }
        },
        
        _clickHandler: function(target){
            // summary:
            //      Handler for click events propagated from add/remove buttons
            // target: DOMNode
            //      The button which was clicked
            
            if (target.className == "add") {
                this._onAddClick();
            } else {
                // get ID of store item based on button id
                // (remove_<widgetID>_row_<ID>)
                console.log("target:", target, target.id);
                var id = target.id.substr(12 + this.id.length);
                console.log("removing ", id);
                this.store.remove(id);
            }
        },
        
        _onAddClick: function(){
            // summary:
            //      Handler for Add button click: adds an item to the store.
            //      If the store is observable, 
            
            var nameTB = this.nameTextBox,
                priceTB = this.priceTextBox;
            
            // check validity of widgets first (forcing UI update)
            if (!nameTB.validate() || !priceTB.validate()) { return; }
            
            this.store.add({
                name: nameTB.get("value"),
                price: priceTB.get("value"),
                date: dateStamp.toISOString(new Date())
            });
            
            // reset textbox widgets for new entry
            nameTB.reset();
            priceTB.reset();
        }
    });

    return Wishlist;
});
