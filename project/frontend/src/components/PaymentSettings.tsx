import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import {
  Save,
  Plus,
  Check,
  Upload,
  QrCode,
  Eye,
  HelpCircle,
  Building,
  Info,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import axios from 'axios';


interface PaymentSetting {
  id: string;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branchName: string;
  swiftCode: string | null;
  accountType: string | null;
  upiId: string | null;
  phone: string | null;
  gpayNumber: string | null;
  phonepeNumber: string | null;
  paytmNumber: string | null;
  qrImage: string | null;
  instructions: string | null;
  showBank: boolean;
  showQR: boolean;
  showUPI: boolean;
  showInstructions: boolean;
  showAccountHolder: boolean;
  showBranch: boolean;
  showIFSC: boolean;
  isDefault: boolean;
  activePaymentMethod: string;
}

interface PaymentSettingsProps {
  isStaff: boolean;
}

const PaymentSettings: React.FC<PaymentSettingsProps> = ({ isStaff }) => {
  const queryClient = useQueryClient();
  const [selectedSetting, setSelectedSetting] = useState<Partial<PaymentSetting> | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [uploadingQr, setUploadingQr] = useState<boolean>(false);
  const [testInvoiceLoading, setTestInvoiceLoading] = useState<boolean>(false);
  const [testInvoiceError, setTestInvoiceError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedQrUrl, setGeneratedQrUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: settings, isLoading } = useQuery<PaymentSetting[]>({
    queryKey: ['payment-settings'],
    queryFn: async () => {
      const res = await api.get('/payment-settings');
      return res.data;
    },
  });

  // Automatically select the default setting or the first one if editing is not active
  useEffect(() => {
    if (settings && settings.length > 0 && !selectedSetting && !isEditing && !isAdding) {
      const defaultSet = settings.find((s) => s.isDefault) || settings[0];
      setSelectedSetting({ ...defaultSet });
    }
  }, [settings, selectedSetting, isEditing, isAdding]);

  // Generate frontend live UPI QR Code preview
  useEffect(() => {
    if (selectedSetting?.upiId) {
      const holderName = selectedSetting.accountHolderName || 'Business';
      const upiLink = `upi://pay?pa=${selectedSetting.upiId}&pn=${encodeURIComponent(holderName)}&cu=INR`;
      import('qrcode').then((QRCode) => {
        QRCode.default.toDataURL(upiLink, { width: 150, margin: 1 })
          .then((url) => setGeneratedQrUrl(url))
          .catch((err) => console.error('Failed to generate QR preview:', err));
      });
    } else {
      setGeneratedQrUrl('');
    }
  }, [selectedSetting?.upiId, selectedSetting?.accountHolderName]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: Partial<PaymentSetting>) => {
      const res = await api.post('/payment-settings', data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      setIsAdding(false);
      setSelectedSetting(data);
      showToast('Payment account added successfully.', 'success');
    },
    onError: (err: unknown) => {
      let msg = 'Failed to add bank account.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PaymentSetting> }) => {
      const res = await api.put(`/payment-settings/${id}`, data);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      setIsEditing(false);
      setSelectedSetting(data);
      showToast('Payment account updated successfully.', 'success');
    },
    onError: (err: unknown) => {
      let msg = 'Failed to update bank account.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/payment-settings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      setSelectedSetting(null);
      showToast('Payment account deleted successfully.', 'success');
    },
    onError: (err: unknown) => {
      let msg = 'Failed to delete bank account.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/payment-settings/default/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] });
      showToast('Default bank account updated.', 'success');
    },
    onError: (err: unknown) => {
      let msg = 'Failed to set default account.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    },
  });

  const showToast = (msg: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  const handleInputChange = <K extends keyof PaymentSetting>(
    field: K,
    value: PaymentSetting[K]
  ) => {
    if (!selectedSetting) return;

    // Clear validation error on change
    const fieldStr = field as string;
    if (validationErrors[fieldStr]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldStr];
        return copy;
      });
    }

    setSelectedSetting((prev) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!selectedSetting?.accountHolderName?.trim()) {
      errors.accountHolderName = 'Account Holder Name is required.';
    }
    if (!selectedSetting?.bankName?.trim()) {
      errors.bankName = 'Bank Name is required.';
    }

    // Account Number: numbers only
    const accNum = selectedSetting?.accountNumber || '';
    if (!accNum.trim()) {
      errors.accountNumber = 'Account Number is required.';
    } else if (!/^\d+$/.test(accNum)) {
      errors.accountNumber = 'Account Number must contain numbers only.';
    }

    // IFSC: exactly 11 characters
    const ifsc = selectedSetting?.ifscCode || '';
    if (!ifsc.trim()) {
      errors.ifscCode = 'IFSC Code is required.';
    } else if (ifsc.length !== 11) {
      errors.ifscCode = 'IFSC Code must be exactly 11 characters.';
    }

    if (!selectedSetting?.branchName?.trim()) {
      errors.branchName = 'Branch Name is required.';
    }

    // UPI ID: format check
    const upi = selectedSetting?.upiId || '';
    if (upi.trim() && !/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+$/.test(upi)) {
      errors.upiId = 'Invalid UPI ID format (e.g. name@bank).';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    if (isAdding) {
      createMutation.mutate(selectedSetting!);
    } else if (isEditing && selectedSetting?.id) {
      updateMutation.mutate({ id: selectedSetting.id, data: selectedSetting });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAdding(false);
    setValidationErrors({});
    if (settings && settings.length > 0) {
      const defaultSet = settings.find((s) => s.isDefault) || settings[0];
      setSelectedSetting({ ...defaultSet });
    } else {
      setSelectedSetting(null);
    }
  };

  const startAdd = () => {
    setIsAdding(true);
    setIsEditing(false);
    setValidationErrors({});
    setSelectedSetting({
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branchName: '',
      swiftCode: '',
      accountType: 'Current',
      upiId: '',
      phone: '',
      gpayNumber: '',
      phonepeNumber: '',
      paytmNumber: '',
      qrImage: '',
      instructions: 'Advance Payment: 50%\nBalance Payment before event\nPlease share payment screenshot after transfer.',
      showBank: true,
      showQR: true,
      showUPI: true,
      showInstructions: true,
      showAccountHolder: true,
      showBranch: true,
      showIFSC: true,
      isDefault: settings && settings.length === 0,
      activePaymentMethod: 'Bank + UPI',
    });
  };

  const startEdit = () => {
    setIsEditing(true);
    setIsAdding(false);
    setValidationErrors({});
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image/jpeg|image/png|image/svg\\+xml')) {
      showToast('Only PNG, JPG, and SVG files are allowed.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploadingQr(true);
    try {
      const res = await api.post('/payment-settings/upload-qr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      handleInputChange('qrImage', res.data.qrImageUrl);
      showToast('QR Code uploaded successfully.', 'success');
    } catch (err: unknown) {
      let msg = 'Failed to upload QR image.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        msg = err.response.data.message;
      }
      showToast(msg, 'error');
    } finally {
      setUploadingQr(false);
    }
  };

  const triggerTestInvoice = async () => {
    setTestInvoiceLoading(true);
    setTestInvoiceError(null);
    try {
      // Fetch latest order
      const ordersRes = await api.get('/orders', { params: { limit: 1 } });
      const latestOrder = ordersRes.data?.data?.[0];

      if (!latestOrder) {
        setTestInvoiceError('Please create at least one order to generate a test invoice PDF.');
        return;
      }

      // Download invoice PDF and show in new tab
      const response = await api.get(`/bills/${latestOrder.id}/invoice`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err: unknown) {
      console.error('Failed to generate test invoice:', err);
      setTestInvoiceError('Failed to generate test invoice PDF. Ensure backend is running.');
    } finally {
      setTestInvoiceLoading(false);
    }
  };

  const getFullBackendUrl = (path: string) => {
    const baseUrl = api.defaults.baseURL || 'http://localhost:3001';
    return `${baseUrl.replace(/\/$/, '')}${path}`;
  };

  if (isLoading) {
    return (
      <div className="card-base p-8 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading payment configurations...</p>
      </div>
    );
  }

  const isFormActive = isEditing || isAdding;

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg p-3.5 text-sm flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3.5 text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Accounts List & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-base p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">Bank Accounts</h2>
              {!isStaff && !isFormActive && (
                <button onClick={startAdd}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                  Add Bank
                </button>
              )}
            </div>

            {settings?.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-border rounded-lg space-y-2">
                <Building className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
                <p className="text-xs text-muted-foreground">No accounts configured yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {settings?.map((setting) => (
                  <div key={setting.id}
                    onClick={() => !isFormActive && setSelectedSetting(setting)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative ${
                      selectedSetting?.id === setting.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:bg-muted/5'
                    } ${isFormActive ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <div className="flex items-start justify-between pr-12">
                      <div>
                        <div className="font-semibold text-sm text-foreground">{setting.bankName}</div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          {setting.accountNumber.replace(/\d(?=\d{4})/g, '•')}
                        </div>
                      </div>
                      {setting.isDefault && (
                        <span className="inline-flex items-center gap-0.5 text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Holder: <span className="font-medium text-foreground">{setting.accountHolderName}</span>
                    </div>

                    {!isStaff && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/60 justify-end">
                        {!setting.isDefault && (
                          <button onClick={(e) => { e.stopPropagation(); setDefaultMutation.mutate(setting.id); }}
                            className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                          >
                            Set Default
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setSelectedSetting(setting); startEdit(); }}
                          className="text-[10px] font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          Edit
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(setting.id); }}
                          className="text-[10px] font-bold text-destructive hover:text-destructive-hover cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Test Invoice generator card */}
          <div className="card-base p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="h-4 w-4 text-primary" />
              Invoice Preview
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Verify how the selected payment configuration, display settings, and custom instructions render on a PDF invoice.
            </p>
            <button onClick={triggerTestInvoice} disabled={testInvoiceLoading}
              className="w-full flex items-center justify-center gap-2 bg-secondary text-foreground hover:bg-secondary/80 border border-border px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              {testInvoiceLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {testInvoiceLoading ? 'Generating...' : 'Generate Test Invoice'}
            </button>
            {testInvoiceError && (
              <p className="text-[11px] text-destructive leading-relaxed mt-2">{testInvoiceError}</p>
            )}
          </div>
        </div>

        {/* Right columns: Editor & Live Preview */}
        <div className="lg:col-span-2 space-y-6">
          {selectedSetting ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Column */}
              <div className="space-y-6">
                <div className="card-base p-5 space-y-5">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      {isAdding ? 'New Payment Setting' : isEditing ? 'Edit Bank Account' : 'Account Config'}
                    </h2>
                    {!isFormActive && !isStaff && (
                      <button onClick={startEdit}
                        className="text-xs font-semibold bg-secondary text-foreground hover:bg-secondary/80 border border-border px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Edit Fields
                      </button>
                    )}
                  </div>

                  {/* Settings form fields */}
                  <div className="space-y-4">
                    {/* Active payment method dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        Active Payment Method
                        <span title="Changes how the payment block renders on PDF invoices">
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                        </span>
                      </label>
                      <select disabled={!isFormActive || isStaff}
                        value={selectedSetting.activePaymentMethod || 'Bank + UPI'}
                        onChange={(e) => handleInputChange('activePaymentMethod', e.target.value)}
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]"
                      >
                        <option value="Bank + UPI">Bank + UPI</option>
                        <option value="Bank Transfer">Bank Transfer Only</option>
                        <option value="UPI">UPI Only</option>
                        <option value="Cash">Cash Only</option>
                        <option value="Cheque">Cheque Only</option>
                      </select>
                    </div>

                    <div className="border-t border-border/80 pt-4 mt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Bank Details</div>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Account Holder Name</label>
                          <input disabled={!isFormActive || isStaff} type="text"
                            value={selectedSetting.accountHolderName || ''}
                            onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                            placeholder="e.g. SEISUVAI CATERING SERVICES"
                            className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px] ${validationErrors.accountHolderName ? 'border-destructive' : 'border-border'}`}
                          />
                          {validationErrors.accountHolderName && (
                            <span className="text-[10px] text-destructive">{validationErrors.accountHolderName}</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Bank Name</label>
                            <input disabled={!isFormActive || isStaff} type="text"
                              value={selectedSetting.bankName || ''}
                              onChange={(e) => handleInputChange('bankName', e.target.value)}
                              placeholder="e.g. Indian Bank"
                              className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px] ${validationErrors.bankName ? 'border-destructive' : 'border-border'}`}
                            />
                            {validationErrors.bankName && (
                              <span className="text-[10px] text-destructive">{validationErrors.bankName}</span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Account Type</label>
                            <select disabled={!isFormActive || isStaff}
                              value={selectedSetting.accountType || 'Current'}
                              onChange={(e) => handleInputChange('accountType', e.target.value)}
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]"
                            >
                              <option value="Current">Current</option>
                              <option value="Savings">Savings</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">Account Number (Numbers only)</label>
                          <input disabled={!isFormActive || isStaff} type="text"
                            value={selectedSetting.accountNumber || ''}
                            onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                            placeholder="e.g. 9876543210"
                            className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px] ${validationErrors.accountNumber ? 'border-destructive' : 'border-border'}`}
                          />
                          {validationErrors.accountNumber && (
                            <span className="text-[10px] text-destructive">{validationErrors.accountNumber}</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">IFSC Code (11 Chars)</label>
                            <input disabled={!isFormActive || isStaff} type="text"
                              value={selectedSetting.ifscCode || ''}
                              onChange={(e) => handleInputChange('ifscCode', e.target.value.toUpperCase())}
                              placeholder="e.g. IDIB0000123"
                              maxLength={11}
                              className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px] uppercase ${validationErrors.ifscCode ? 'border-destructive' : 'border-border'}`}
                            />
                            {validationErrors.ifscCode && (
                              <span className="text-[10px] text-destructive">{validationErrors.ifscCode}</span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Branch Name</label>
                            <input disabled={!isFormActive || isStaff} type="text"
                              value={selectedSetting.branchName || ''}
                              onChange={(e) => handleInputChange('branchName', e.target.value)}
                              placeholder="e.g. Kaladipet"
                              className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px] ${validationErrors.branchName ? 'border-destructive' : 'border-border'}`}
                            />
                            {validationErrors.branchName && (
                              <span className="text-[10px] text-destructive">{validationErrors.branchName}</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">SWIFT Code (Optional)</label>
                          <input disabled={!isFormActive || isStaff} type="text"
                            value={selectedSetting.swiftCode || ''}
                            onChange={(e) => handleInputChange('swiftCode', e.target.value.toUpperCase())}
                            placeholder="e.g. IDIBINBBXXX"
                            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/80 pt-4 mt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">UPI & Mobile Numbers</div>
                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-muted-foreground">UPI ID (e.g. name@bank)</label>
                          <input disabled={!isFormActive || isStaff} type="text"
                            value={selectedSetting.upiId || ''}
                            onChange={(e) => handleInputChange('upiId', e.target.value)}
                            placeholder="e.g. seisuvai@okaxis"
                            className={`w-full rounded-lg border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px] ${validationErrors.upiId ? 'border-destructive' : 'border-border'}`}
                          />
                          {validationErrors.upiId && (
                            <span className="text-[10px] text-destructive">{validationErrors.upiId}</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Mobile Phone</label>
                            <input disabled={!isFormActive || isStaff} type="text"
                              value={selectedSetting.phone || ''}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="e.g. 7395911772"
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Google Pay No</label>
                            <input disabled={!isFormActive || isStaff} type="text"
                              value={selectedSetting.gpayNumber || ''}
                              onChange={(e) => handleInputChange('gpayNumber', e.target.value)}
                              placeholder="Google Pay No"
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">PhonePe No</label>
                            <input disabled={!isFormActive || isStaff} type="text"
                              value={selectedSetting.phonepeNumber || ''}
                              onChange={(e) => handleInputChange('phonepeNumber', e.target.value)}
                              placeholder="PhonePe No"
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-muted-foreground">Paytm No</label>
                            <input disabled={!isFormActive || isStaff} type="text"
                              value={selectedSetting.paytmNumber || ''}
                              onChange={(e) => handleInputChange('paytmNumber', e.target.value)}
                              placeholder="Paytm No"
                              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 min-h-[44px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-border/80 pt-4 mt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">QR Code Image</div>
                      <div className="space-y-3">
                        {selectedSetting.qrImage ? (
                          <div className="p-3 border border-border bg-muted/20 rounded-lg flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-10 w-10 bg-white border border-border rounded flex items-center justify-center overflow-hidden shrink-0">
                                <img src={getFullBackendUrl(selectedSetting.qrImage)} alt="QR Code" className="h-full w-full object-contain" />
                              </div>
                              <span className="text-xs text-muted-foreground truncate font-mono">Custom Uploaded QR</span>
                            </div>
                            {!isStaff && isFormActive && (
                              <button onClick={() => handleInputChange('qrImage', '')}
                                className="text-xs text-destructive hover:underline font-bold shrink-0 cursor-pointer"
                              >
                                Delete QR
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground leading-relaxed">
                              Upload a static QR code image, or leave blank to automatically generate a QR code from the UPI ID.
                            </div>
                            {isFormActive && !isStaff && (
                              <div className="flex gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleQrUpload} className="hidden" accept="image/png, image/jpeg, image/svg+xml" />
                                <button onClick={() => fileInputRef.current?.click()} disabled={uploadingQr}
                                  className="inline-flex items-center gap-1.5 text-xs font-semibold bg-secondary hover:bg-secondary/80 border border-border px-3 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  {uploadingQr ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                  ) : (
                                    <Upload className="h-3.5 w-3.5" />
                                  )}
                                  {uploadingQr ? 'Uploading...' : 'Upload QR'}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border/80 pt-4 mt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Display Options</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {([
                          ['showBank', 'Show Bank Details'],
                          ['showQR', 'Show QR Code'],
                          ['showUPI', 'Show UPI ID'],
                          ['showInstructions', 'Show Instructions'],
                          ['showAccountHolder', 'Show Account Holder'],
                          ['showBranch', 'Show Branch'],
                          ['showIFSC', 'Show IFSC'],
                        ] as [keyof PaymentSetting, string][]).map(([field, label]) => {
                          const val = !!selectedSetting[field];
                          return (
                            <label key={field} className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none py-1">
                              <input type="checkbox" disabled={!isFormActive || isStaff}
                                checked={val}
                                onChange={(e) => handleInputChange(field, e.target.checked)}
                                className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-0 accent-primary"
                              />
                              <span>{label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-border/80 pt-4 mt-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Payment Instructions</div>
                      <div className="space-y-1.5">
                        <textarea disabled={!isFormActive || isStaff} rows={3}
                          value={selectedSetting.instructions || ''}
                          onChange={(e) => handleInputChange('instructions', e.target.value)}
                          placeholder="e.g. Advance payment: 50%. Final balance payment before event."
                          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary disabled:opacity-50 font-sans"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Form Action Buttons */}
                  {isFormActive && !isStaff && (
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                      <button onClick={handleCancel}
                        className="px-4 py-2 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}
                        className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        Save Settings
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time Invoice preview column */}
              <div className="space-y-6">
                <div className="sticky top-6">
                  <div className="card-base p-5 space-y-4">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Live Invoice Display</h3>
                    
                    {/* Simulated PDF Layout container */}
                    <div className="bg-[#FAF7EE] border border-[#D4A843] rounded-lg p-5 shadow-sm text-[#1A1A1A] font-sans relative overflow-hidden text-left">
                      {/* Gold border lines mock */}
                      <div className="absolute top-1 left-1 right-1 bottom-1 border border-[#D4A843]/30 pointer-events-none" />

                      {/* Header Line */}
                      <div className="border-b border-[#C9A54E] pb-2 mb-3 text-center">
                        <div className="text-[10px] font-bold text-[#A88B3D] tracking-widest uppercase">Invoice Details Preview</div>
                      </div>

                      {/* Mock Invoice Items space */}
                      <div className="h-20 border-b border-[#C9A54E]/40 border-dashed flex flex-col justify-center items-center text-[10px] text-gray-400">
                        <span>[ Invoice Items List & Summary Area ]</span>
                      </div>

                      {/* Bank & QR Details simulated block */}
                      <div className="pt-4 grid grid-cols-5 gap-4">
                        {/* Details fields */}
                        <div className="col-span-3 space-y-2">
                          {selectedSetting.activePaymentMethod === 'Cash' || selectedSetting.activePaymentMethod === 'Cheque' ? (
                            <div>
                              <div className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">PAYMENT DETAILS</div>
                              <div className="text-[9px] font-semibold text-gray-700">
                                Payment Method: <span className="font-bold text-[#1A1A1A]">{selectedSetting.activePaymentMethod}</span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-2">
                                {selectedSetting.activePaymentMethod === 'UPI' ? 'UPI PAYMENT DETAILS' : 'BANK PAYMENT DETAILS'}
                              </div>
                              <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[8px] text-gray-700">
                                {selectedSetting.showBank && selectedSetting.activePaymentMethod !== 'UPI' && (
                                  <>
                                    {selectedSetting.showAccountHolder && (
                                      <>
                                        <span className="font-bold">Account Name</span>
                                        <span className="truncate">: {selectedSetting.accountHolderName}</span>
                                      </>
                                    )}
                                    <span className="font-bold">Bank</span>
                                    <span className="truncate">: {selectedSetting.bankName}</span>
                                    <span className="font-bold">Account No</span>
                                    <span className="truncate">: {selectedSetting.accountNumber}</span>
                                    {selectedSetting.showIFSC && (
                                      <>
                                        <span className="font-bold">IFSC Code</span>
                                        <span className="truncate">: {selectedSetting.ifscCode}</span>
                                      </>
                                    )}
                                    {selectedSetting.showBranch && (
                                      <>
                                        <span className="font-bold">Branch</span>
                                        <span className="truncate">: {selectedSetting.branchName}</span>
                                      </>
                                    )}
                                    {selectedSetting.swiftCode && (
                                      <>
                                        <span className="font-bold">SWIFT Code</span>
                                        <span className="truncate">: {selectedSetting.swiftCode}</span>
                                      </>
                                    )}
                                  </>
                                )}
                                {selectedSetting.showUPI && selectedSetting.upiId && selectedSetting.activePaymentMethod !== 'Bank Transfer' && (
                                  <>
                                    <span className="font-bold border-t border-gray-200/50 pt-1 mt-1">UPI ID</span>
                                    <span className="truncate font-semibold text-[#A88B3D] border-t border-gray-200/50 pt-1 mt-1">: {selectedSetting.upiId}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* QR Code preview */}
                        <div className="col-span-2 flex flex-col items-center justify-start text-center">
                          {selectedSetting.showQR && (selectedSetting.activePaymentMethod === 'UPI' || selectedSetting.activePaymentMethod === 'Bank + UPI') ? (
                            <>
                              <div className="text-[8px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1.5">SCAN & PAY</div>
                              <div className="bg-white border border-gray-200 p-1.5 rounded flex items-center justify-center shrink-0 w-[78px] h-[78px] overflow-hidden">
                                {selectedSetting.qrImage ? (
                                  <img src={getFullBackendUrl(selectedSetting.qrImage)} alt="QR Code" className="h-full w-full object-contain" />
                                ) : generatedQrUrl ? (
                                  <img src={generatedQrUrl} alt="Generated UPI QR" className="h-full w-full object-contain" />
                                ) : (
                                  <span className="text-[6px] text-gray-300">Set UPI ID</span>
                                )}
                              </div>
                            </>
                          ) : (
                            <div className="h-[78px] flex items-center justify-center text-[7px] text-gray-300 italic border border-dashed border-gray-200 rounded w-full">
                              QR Hidden
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Instructions preview */}
                      {selectedSetting.showInstructions && selectedSetting.instructions && (
                        <div className="mt-3 border-t border-[#C9A54E]/30 pt-2.5">
                          <div className="text-[8px] font-bold text-[#1A1A1A] uppercase tracking-wider mb-1">PAYMENT INSTRUCTIONS</div>
                          <div className="text-[7.5px] text-gray-600 whitespace-pre-line leading-relaxed italic">
                            {selectedSetting.instructions}
                          </div>
                        </div>
                      )}

                      {/* Footer thank you mock */}
                      <div className="mt-4 pt-3 border-t border-[#C9A54E] text-center">
                        <div className="text-[12px] font-bold text-[#A88B3D] italic font-serif">Thank You!</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-muted-foreground flex gap-1.5 bg-muted/10 p-3 rounded-lg border border-border/60">
                      <Info className="h-4 w-4 text-primary shrink-0" />
                      <span>This preview displays real-time layout rendering. Click <strong>Save Settings</strong> to commit the changes.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-base p-8 text-center space-y-3">
              <Building className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm text-muted-foreground">Select a bank account from the list or add a new one to configure payment settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
