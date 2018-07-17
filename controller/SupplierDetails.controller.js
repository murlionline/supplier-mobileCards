sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType"
], function (Controller, JSONModel, Filter, FilterOperator, FilterType) {
	"use strict";

	var oAppModel;

	return Controller.extend("teched.suppliersupplierdetails.controller.SupplierDetails", {

		onInit: function () {
			this.oView = this.getView();
			this.component = this.getOwnerComponent();
			this.bundle = this.component.getModel("i18n");
		},

		onAfterRendering: function () {
			this.oView.setBusy(true);
			this.oSF = this.oView.byId("searchField");
			this.mobileCardContainer = this.oView.byId("mobileCardContainer");
			this.mobileCardIcon = this.oView.byId("mobileCardIcon");

			/*
			this.ICON_COLOR = sap.ui.core.theming.Parameters.get("sapBrandColor");
			this.ICON_HOVER_COLOR = sap.ui.core.theming.Parameters.get("sapContent_ContrastFocusColor");
			this.ICON_BACKGROUND_COLOR = sap.ui.core.theming.Parameters.get("sapContent_ContrastFocusColor");
			this.ICON_BACKGROUND_HOVER_COLOR = sap.ui.core.theming.Parameters.get("sapBrandColor");
			*/

			this.mobileCardIcon.setColor(sap.ui.core.theming.Parameters.get("sapBrandColor"));
			this.mobileCardIcon.setHoverColor(sap.ui.core.theming.Parameters.get("sapContent_ContrastFocusColor"));
			this.mobileCardIcon.setBackgroundColor(sap.ui.core.theming.Parameters.get("sapContent_ContrastFocusColor"));
			this.mobileCardIcon.setHoverBackgroundColor(sap.ui.core.theming.Parameters.get("sapBrandColor"));

			oAppModel = this.component.getModel("app");
			oAppModel.setProperty("/supplierLoaded", false);
			oAppModel.setProperty("/errorMsg", "Could not establish connection...");

			var oDataModel = this.component.getModel("data");
			oDataModel.read("/Suppliers", {
				success: this.setSuppliersModel.bind(this),
				error: function (e) {

				}.bind(this)
			});
		},

		setSuppliersModel: function (oSuppliers) {
			var oModel = new JSONModel();
			oModel.setData(oSuppliers.results);
			this.oView.setModel(oModel, "oSuppliers");
			this.oView.setBusy(false);
		},

		onSearch: function (event) {
			this.oView.setBusy(true);
			var item = event.getParameter("suggestionItem");
			if (item) {
				var key = item.getKey();
				var oDataModel = this.component.getModel("data");
				var odataObjID = "/Suppliers('" + key + "')";
				oDataModel.read(odataObjID, {
					success: this.setSupplierDetails.bind(this),
					error: function (e) {

					}.bind(this)
				});
			}
		},

		onSuggest: function (event) {
			var value = event.getParameter("suggestValue");
			var filters = [];
			if (value) {
				filters = [
					new Filter([
						new sap.ui.model.Filter("Name", function (sDes) {
							return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
						})
					], false)
				];
			}
			this.oSF.getBinding("suggestionItems").filter(filters);
			this.oSF.suggest();
		},

		setSupplierDetails: function (oSupplier) {
			this.oView.setBusy(false);
			this._isSupplierInitialized = true;
			oAppModel.setProperty("/supplier", oSupplier || {});
			oAppModel.setProperty("/supplierLoaded", true);
		},


		handleToMobileCardPress: function (oEvent) {
			var sCardTypeGUID = "DD679612-8B6D-492B-93AB-0AFDF8CBBAD2";
			if (!sCardTypeGUID || sCardTypeGUID.length === 0) {
				sap.m.MessageToast.show("You must set the Template ID first");
				return;
			}

			var url = "/mobileCards/origin/hcpms/CARDS/v1/cardTypes/" + sCardTypeGUID + "/cardInstances";
			var id = oAppModel.getProperty("/supplier").Id;
			var bodyJson = {
				"resourceIdentifiers": [{
					"uri": "/sap/opu/odata/sap/EPM_REF_APPS_PROD_MAN_SRV/Suppliers('" + id + "')?sap-client=002"
				}]
			};

			jQuery.ajax({
				url: url,
				async: true,
				type: "POST",
				data: JSON.stringify(bodyJson),
				headers: {
					'content-type': 'application/json'
				},
				success: function (data, textStatus, xhr) {
					if (xhr.status === 201) {
						sap.m.MessageToast.show("Successfully added Card");
					} else if (xhr.status === 200) {
						sap.m.MessageToast.show("Card has already been added");
					} else {
						sap.m.MessageToast.show("This Card cannot be added");
					}
				},
				error: function (xhr, textStatus, error) {
					sap.m.MessageToast.show("This Card cannot be added");
				}
			});
		}
	});
});