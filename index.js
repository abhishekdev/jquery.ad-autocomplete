/*!
 * Extend jQuery-ui autocomplete to support multiselect
 *
 * @author Abhishek Dev
 * @date 30-Aug-2015
 * Copyright (c) 2015 Abhishek Dev; Licensed MIT
 * CREDITS: reference http://jsfiddle.net/sgxkj/
 */
$.widget("ad.autocomplete", $.ui.autocomplete, {
    options: $.extend({}, $.ui.autocomplete.prototype.options, {
        syncSelectedItemKeysWith: null,
        width: null,
        multiselect: false
    }),
    _create: function () {
        this._super();

        var self = this,
            o = self.options,
            fontSize, kc;

        if (o.multiselect) {

            self.selectedItems = {};
            self.multiselect = $("<div/>", {
                    "class": "ui-autocomplete-multiselect ui-state-default ui-widget",
                    css: {
                        width: o.width || self.element.width()
                    }
                }).insertBefore(self.element)
                .append(self.element)
                .on("click.autocomplete focus.autocomplete", function () {
                    self.element.focus();
                })
                .on("click.autocomplete", '.ui-autocomplete-multiselect-removeitem', function (e) {
                    var item = $(this).parent();
                    if (self.remove(self.selectedItems, item)) {
                        item.remove();
                    }
                });

            fontSize = parseInt(self.element.css("fontSize"), 10);
            kc = $.ui.keyCode;

            self.element.bind({
                "keydown.autocomplete": function (e) {
                    if ((this.value === "") && (e.keyCode == kc.BACKSPACE)) {
                        var item = self.element.prev();
                        if (self.remove(self.selectedItems, item)) {
                            item.remove();
                        }
                    }
                },
                "focus.autocomplete blur.autocomplete": function () {
                    self.multiselect.toggleClass("ui-state-active");
                }
            }).trigger("change");

            o.select = o.select || function (e, ui) {
                if (self.add(self.selectedItems, ui.item)) {
                    self._renderMultiselectItem(self.element, ui.item);
                }
                self._value('');

                return false;
            };
        }

        return this;
    },
    sync: function () {
        var self = this,
            $syncSelectedItemKeys = $(self.options.syncSelectedItemKeysWith);
        if ($syncSelectedItemKeys.length && $syncSelectedItemKeys.is('input, textarea')) {
            $syncSelectedItemKeys.val(Object.keys(self.selectedItems).join(','));
        }
    },
    removeAll: function () {
        var self = this;

        self.selectedItems = {};
        self.multiselect.find('.ui-autocomplete-multiselect-item').remove();

        self.sync();
    },
    remove: function (list, item) {
        var label = item.text(),
            isFound = typeof list[label] != 'undefined';

        if (isFound) {
            delete list[label];
            this.sync();
        }

        return isFound;
    },
    add: function (list, item) {
        var isNewItem = typeof list[item.label] === 'undefined';

        if (isNewItem) {
            list[item.label] = item;
            this.sync();
        }

        return isNewItem;
    },
    _renderMultiselectItem: function (ui, item) {
        return $("<div/>", {
                "class": "ui-autocomplete-multiselect-item"
            })
            .append(
                $("<span/>", {
                    "class": "ui-icon ui-icon-close ui-autocomplete-multiselect-removeitem"
                })
            )
            .append('<span>' + item.label + '</span>')
            .insertBefore(ui);
    },
    _suggest: function (items) {
        var self = this;

        self._super(items);

        if (self.options.multiselect) {
            self.menu.element.position({
                my: "left top",
                at: "left bottom",
                of: self.multiselect
            });
        }
    },
    _resizeMenu: function () {
        var self = this,
            menu = this.menu.element;

        if (self.options.multiselect) {
            menu.outerWidth(Math.max(
                menu.width('').outerWidth() + 1,
                self.multiselect.outerWidth()
            ));
        } else {
            self._super();
        }
    }
});
