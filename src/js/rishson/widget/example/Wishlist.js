define([
	"dojo/_base/declare",
	"rishson/widget/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	"dojo/_base/lang",
	"dojo/_base/array", // forEach
	"dojo/on", // for event delegation
	"dojo/has",
	"dojo/dom", // for byId
	"dojo/dom-construct", // for create, place, destroy
	"dojo/currency", // for formatting currency based on locale
	"dojo/date/locale", // for formatting dates based on locale
	"dojo/date/stamp", // for serialization between Date and ISO 8601 string
	"dojo/text!./resources/Wishlist.html", // widget template
	"dojo/i18n!./nls/Wishlist", // widget i18n bundle
	"dojo/_base/sniff", // adds has tests for UA detection
	// widgets used in template, not referenced directly in module
	"dijit/form/ValidationTextBox",
	"dijit/form/CurrencyTextBox"
], function (declare, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, lang, arrayUtil, on, has, dom, domConstruct, currency, dateLocale, dateStamp, template, l10n) {

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

		constructor: function (args) {
			if (!args.store) {
				throw new Error("Wishlist requires a store instance to hold items.");
			}

			// Initialize query to blank object on instance.
			// If passed in args, this will be overwritten.
			this.query = {};
		},

		postCreate: function () {
			var self = this,
			// IE < 9 doesn't fire/propagate onchange properly
				event = has("ie") && (has("ie") < 9 || has("quirks")) ?
					"click" : "change";

			this.inherited(arguments);

			// set up delegated event handler for remove/add button clicks
			on(this.tableNode, ".button:click, .button:keydown", function (evt) {
				var keyCode = evt.keyCode;

				// trigger on mouse clicks or enter/space keypresses
				if (evt.type == "click" || keyCode == 13 || keyCode == 32) {
					// stop default behavior (e.g. following links)
					evt.preventDefault();
					// call _clickHandler on instance, passing clicked button
					self._clickHandler(this);
				}
			});

			// set up delegated event handler for sort control changes
			on(this.sortNode, "input:" + event, lang.hitch(this, "_doQuery"));

			// create array referencing radio buttons for getSortOptions
			this.sortRadios = [
				this.sortNameRadio, this.sortPriceRadio, this.sortDateRadio
			];

			// run initial query
			this._doQuery();
		},

		uninitialize: function () {
			// unhook any observer that exists upon destruction
			this._observer && this._observer.cancel();
		},

		_doQuery: function () {
			// summary:
			//      Performs a query and (re)populates the table body.

			var results = this.store.query(this.query, {
					sort: this._getSortOptions()
				}),
				self = this;

			// remove existing rows before populating
			domConstruct.empty(this.tbodyNode);

			results.forEach(function (item, index) {
				// reuse _observeHandler's logic by simulating an item addition
				self._observeHandler(item, -1, index);
			});

			// unhook any existing observer before setting up new one
			if (this._observer) {
				this._observer.cancel();
			}
			if (results.observe) {
				this._observer = results.observe(
					lang.hitch(this, "_observeHandler"), true);
			}

			return results; // promise or Array
		},

		_getSortOptions: function () {
			// summary:
			//      Retrieves sort options based on state of inputs

			var descending = this.descendingCheck.checked,
			// find checked radio button; its value is the field to sort by
				attribute = arrayUtil.filter(this.sortRadios, function (input) {
					return input.checked;
				})[0].value;

			// queryOptions.sort takes an array of attributes
			return [
				{ attribute: attribute, descending: descending }
			];
		},

		_getRowId: function (item) {
			// summary:
			//      Generates a determinstic id for a tr in the tbody.
			return this.id + "_row_" + this.store.getIdentity(item);
		},

		_observeHandler: function (item, from, to) {
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
				cell = domConstruct.create("td", {
					"class": "name"
				}, row);
				cell.appendChild(document.createTextNode(item.name));

				cell = domConstruct.create("td", {
					"class": "price"
				}, row);
				cell.appendChild(document.createTextNode(
					currency.format(item.price)));

				cell = domConstruct.create("td", {
					"class": "date"
				}, row);
				cell.appendChild(document.createTextNode(
					dateLocale.format(dateStamp.fromISOString(item.date))));

				// add cell containing remove button
				cell = domConstruct.create("td", {
					"class": "actions"
				}, row);
				domConstruct.create("a", {
					// give a deterministic id for tracing back to item id
					id: "remove_" + rowId,
					innerHTML: l10n.Remove,
					"class": "button remove",
					href: "#"
				}, cell);

				// insert row into table at appropriate position
				domConstruct.place(row, this.tbodyNode, to);
			}
		},

		_clickHandler: function (target) {
			// summary:
			//      Handler for click events propagated from add/remove buttons
			// target: DOMNode
			//      The button which was clicked

			if (target.className.indexOf("add") > -1) {
				this._onAddClick();
			} else {
				// get ID of store item based on button id
				// (remove_<widgetID>_row_<ID>)
				var id = target.id.substr(12 + this.id.length);
				this.store.remove(id);
			}
		},

		_onAddClick: function () {
			// summary:
			//      Handler for Add button click: adds an item to the store.
			//      If the store is observable, this will ultimately result in
			//      _observeHandler being fired.

			var nameTB = this.nameTextBox,
				priceTB = this.priceTextBox,
				result;

			// check validity of widgets first (forcing UI update)
			if (!nameTB.validate() || !priceTB.validate()) {
				this._onInvalidAdd();
				return false;
			}

			result = this.store.add({
				name: nameTB.get("value"),
				price: priceTB.get("value"),
				date: dateStamp.toISOString(new Date())
			});

			// reset textbox widgets for new entry
			nameTB.reset();
			priceTB.reset();

			// re-focus name field
			nameTB.focus();

			return result;
		},

		_onInvalidAdd: function () {
			// summary:
			//      Stub method that fires if the user attempts to add an item
			//      while fields are in an invalid state.
		}
	});

	return Wishlist;
});
