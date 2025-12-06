"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, FileText } from "lucide-react";

interface Customer {
  id: string;
  companyName: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface Template {
  id: string;
  category: string;
  title: string;
  template: string;
  defaultValues: Record<string, string>;
}

interface QuotationItem {
  scopeOfWork: string;
  description: string;
  quantity: number;
  rate: number;
  vatRate: number;
  subTotal: number;
}

export default function NewQuotationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [vatPercentage, setVatPercentage] = useState(5);

  // Form state
  const [customerId, setCustomerId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuotationItem[]>([]);

  // Fetch customers and templates
  useEffect(() => {
    Promise.all([
      fetch("/api/customers").then((res) => res.json()),
      fetch("/api/templates").then((res) => res.json()),
      fetch("/api/settings").then((res) => res.json()),
    ]).then(([customersData, templatesData, settingsData]) => {
      setCustomers(customersData);
      setTemplates(templatesData.templates || []);
      if (settingsData.vat_percentage) {
        setVatPercentage(parseFloat(settingsData.vat_percentage));
      }
    });
  }, []);

  const addItem = () => {
    setItems([
      ...items,
      {
        scopeOfWork: "",
        description: "",
        quantity: 1,
        rate: 0,
        vatRate: 0,
        subTotal: 0,
      },
    ]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (
    index: number,
    field: keyof QuotationItem,
    value: any
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Recalculate
    if (field === "quantity" || field === "rate") {
      const qty =
        field === "quantity"
          ? parseFloat(value) || 0
          : newItems[index].quantity;
      const rate =
        field === "rate" ? parseFloat(value) || 0 : newItems[index].rate;
      const subtotal = qty * rate;
      const vatAmount = subtotal * (vatPercentage / 100);

      newItems[index].vatRate = vatAmount;
      newItems[index].subTotal = subtotal;
    }

    setItems(newItems);
  };

  const applyTemplate = (index: number, templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      updateItem(index, "scopeOfWork", template.title);
      updateItem(index, "description", template.template);
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.subTotal, 0);
  };

  const calculateVAT = () => {
    return calculateSubtotal() * (vatPercentage / 100);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status: "DRAFT" | "SENT" = "DRAFT"
  ) => {
    e.preventDefault();

    if (!customerId || !projectName || items.length === 0) {
      alert("Please fill in all required fields and add at least one item");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          projectName,
          siteLocation,
          notes,
          status,
          vatPercentage,
          items,
        }),
      });

      if (response.ok) {
        const quotation = await response.json();
        router.push(`/quotations/${quotation.id}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create quotation");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while creating the quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">New Quotation</h1>
        <p className="text-gray-600 mt-1">Create a new project quotation</p>
      </div>

      <form className="space-y-6">
        {/* Basic Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Project Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer *
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="" className="text-gray-900">
                  Select Customer
                </option>
                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                    className="text-gray-900"
                  >
                    {customer.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Villa Glass Installation"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Location
              </label>
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="e.g., Dubai Marina"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Any additional notes..."
              />
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Line Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    Item #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template (Optional)
                    </label>
                    <select
                      onChange={(e) => applyTemplate(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="" className="text-gray-900">
                        Select a template...
                      </option>
                      {templates.map((template) => (
                        <option
                          key={template.id}
                          value={template.id}
                          className="text-gray-900"
                        >
                          {template.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scope of Work *
                    </label>
                    <input
                      type="text"
                      value={item.scopeOfWork}
                      onChange={(e) =>
                        updateItem(index, "scopeOfWork", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="e.g., Supply and install 12mm tempered glass"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      placeholder="Additional details..."
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rate (AED) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) =>
                          updateItem(index, "rate", e.target.value)
                        }
                        required
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        VAT Rate (AED)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.vatRate.toFixed(2)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sub-Total (AED)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.subTotal.toFixed(2)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p>No items added yet</p>
                <p className="text-sm mt-1">Click "Add Item" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Totals */}
        {items.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Summary</h2>
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">
                  AED{" "}
                  {calculateSubtotal().toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>VAT ({vatPercentage}%):</span>
                <span className="font-medium">
                  AED{" "}
                  {calculateVAT().toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                <span>Total:</span>
                <span>
                  AED{" "}
                  {calculateTotal().toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "DRAFT")}
            disabled={loading}
            className="flex items-center px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Save className="mr-2 h-5 w-5" />
            Save as Draft
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, "SENT")}
            disabled={loading}
            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <FileText className="mr-2 h-5 w-5" />
            Save & Mark as Sent
          </button>
        </div>
      </form>
    </div>
  );
}
