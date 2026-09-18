import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Settings as SettingsIcon, Save, CheckCircle2, Truck, Building2, Phone, Mail, Percent, DollarSign } from 'lucide-react';
import api from '@/lib/axios';
import { toast } from 'sonner';

interface SystemSettingsData {
  id: string;
  companyName: string;
  companyLogo?: string;
  defaultDeliveryCharge: number;
  defaultCodCharge: number;
  contactPhone: string;
  contactEmail: string;
  address: string;
}

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState('SwiftCourier Logistics System');
  const [companyLogo, setCompanyLogo] = useState('');
  const [defaultDeliveryCharge, setDefaultDeliveryCharge] = useState('12.50');
  const [defaultCodCharge, setDefaultCodCharge] = useState('1.5');
  const [contactPhone, setContactPhone] = useState('+1 (555) 019-2831');
  const [contactEmail, setContactEmail] = useState('support@swiftcourier.com');
  const [address, setAddress] = useState('Central Express Tower, Lackawanna District');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/settings');
      if (res.success && res.data) {
        const s: SystemSettingsData = res.data;
        setCompanyName(s.companyName);
        setCompanyLogo(s.companyLogo || '');
        setDefaultDeliveryCharge(s.defaultDeliveryCharge.toString());
        setDefaultCodCharge(s.defaultCodCharge.toString());
        setContactPhone(s.contactPhone);
        setContactEmail(s.contactEmail);
        setAddress(s.address);
      }
    } catch (_err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSuccessMessage(null);
      const payload = {
        companyName,
        companyLogo: companyLogo || undefined,
        defaultDeliveryCharge: parseFloat(defaultDeliveryCharge),
        defaultCodCharge: parseFloat(defaultCodCharge),
        contactPhone,
        contactEmail,
        address,
      };

      const res: any = await api.put('/settings', payload);
      if (res.success) {
        toast.success('System settings & global pricing defaults updated successfully!');
        setSuccessMessage('System settings & global pricing defaults updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-primary" /> System Configuration & Settings
        </h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Manage company branding, contact details, thermal print header info, and global default delivery/COD rates.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading system settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Company Branding Card */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" /> Company Identity & Contact
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Official company profile printed on shipping receipts and customer tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Company Name *</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1 font-bold text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Company Logo Image URL</label>
                  <Input
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                    placeholder="https://domain.com/logo.png"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Support Phone *</label>
                  <Input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Support Email *</label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="mt-1 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Head Office Address *</label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Default Rates & Pricing Card */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="bg-slate-50 border-b pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> Default Delivery & COD Charges
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Fallback pricing rates used when a merchant does not have custom pricing set.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-sky-600" /> Standard Delivery Fee ($)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    value={defaultDeliveryCharge}
                    onChange={(e) => setDefaultDeliveryCharge(e.target.value)}
                    className="font-bold text-sm bg-white"
                  />
                  <div className="text-[11px] text-slate-500">Default charge for standard parcel delivery</div>
                </div>

                <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-purple-600" /> Standard COD Fee (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={defaultCodCharge}
                    onChange={(e) => setDefaultCodCharge(e.target.value)}
                    className="font-bold text-sm bg-white"
                  />
                  <div className="text-[11px] text-slate-500">Default percentage charge on cash on delivery amount</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-blue-900 text-white font-bold h-11 px-8 gap-2 shadow-md"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save System Settings'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
