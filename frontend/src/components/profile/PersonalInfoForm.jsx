import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, X, CheckCircle, AlertCircle } from 'lucide-react';

// Validation schema
const personalInfoSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  university: z.string().optional(),
  department: z.string().optional(),
  graduationYear: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
  address: z.string().optional(),
});

const PersonalInfoForm = ({ user, onSave, onCancel }) => {
  const [characterCount, setCharacterCount] = useState(user?.bio?.length || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      university: user?.university || '',
      department: user?.department || '',
      graduationYear: user?.graduationYear || '',
      bio: user?.bio || '',
      address: user?.address || '',
    },
  });

  // Watch bio field for character count
  const bioValue = watch('bio');
  React.useEffect(() => {
    setCharacterCount(bioValue?.length || 0);
  }, [bioValue]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await onSave(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const isStudent = user?.role === 'student';
  const isAdvisor = user?.role === 'advisor';

  return (
    <div className="bg-white border border-gray-200 rounded-md p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-black">Personal Information</h2>
        {saveSuccess && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-success rounded-lg">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">Changes saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Section */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Basic Information</h3>

          {/* Full Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Full Name <span className="text-error">*</span>
            </label>
            <input
              type="text"
              {...register('fullName')}
              className={`w-full h-12 px-4 border rounded-lg text-base transition-all duration-200 ${
                errors.fullName
                  ? 'border-error focus:border-error focus:ring-2 focus:ring-error focus:ring-opacity-20'
                  : 'border-gray-200 focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20'
              } outline-none`}
              placeholder="Enter your full name"
            />
            {errors.fullName && (
              <p className="mt-2 text-sm text-error flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Email <span className="text-error">*</span>
            </label>
            <input
              type="email"
              {...register('email')}
              className={`w-full h-12 px-4 border rounded-lg text-base transition-all duration-200 ${
                errors.email
                  ? 'border-error focus:border-error focus:ring-2 focus:ring-error focus:ring-opacity-20'
                  : 'border-gray-200 focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20'
              } outline-none`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-error flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.email.message}
              </p>
            )}
            {user?.emailVerified && (
              <p className="mt-2 text-sm text-success flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                Email is verified
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              {...register('phone')}
              className="w-full h-12 px-4 border border-gray-200 rounded-lg text-base focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20 outline-none transition-all duration-200"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Address */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Address
            </label>
            <input
              type="text"
              {...register('address')}
              className="w-full h-12 px-4 border border-gray-200 rounded-lg text-base focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20 outline-none transition-all duration-200"
              placeholder="Enter your address"
            />
          </div>
        </div>

        {/* Education Section (Students Only) */}
        {isStudent && (
          <>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-black mb-4">Education</h3>

              {/* University */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  University <span className="text-error">*</span>
                </label>
                <select
                  {...register('university')}
                  className={`w-full h-12 px-4 border rounded-lg text-base transition-all duration-200 bg-white cursor-pointer ${
                    errors.university
                      ? 'border-error focus:border-error focus:ring-2 focus:ring-error focus:ring-opacity-20'
                      : 'border-gray-200 focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20'
                  } outline-none`}
                >
                  <option value="">Select your university</option>
                  <option value="Addis Ababa University">Addis Ababa University</option>
                  <option value="Jimma University">Jimma University</option>
                  <option value="Gondar University">Gondar University</option>
                  <option value="Haramaya University">Haramaya University</option>
                  <option value="Bahir Dar University">Bahir Dar University</option>
                  <option value="Hawassa University">Hawassa University</option>
                  <option value="Mekelle University">Mekelle University</option>
                  <option value="Arba Minch University">Arba Minch University</option>
                  <option value="Adama Science and Technology University">Adama Science and Technology University</option>
                  <option value="Dire Dawa University">Dire Dawa University</option>
                  <option value="Wollo University">Wollo University</option>
                  <option value="Debre Markos University">Debre Markos University</option>
                  <option value="Debre Berhan University">Debre Berhan University</option>
                  <option value="Wolkite University">Wolkite University</option>
                  <option value="Wolaita Sodo University">Wolaita Sodo University</option>
                  <option value="Mizan-Tepi University">Mizan-Tepi University</option>
                  <option value="Bule Hora University">Bule Hora University</option>
                  <option value="Dilla University">Dilla University</option>
                  <option value="Wachemo University">Wachemo University</option>
                  <option value="Woldia University">Woldia University</option>
                  <option value="Adigrat University">Adigrat University</option>
                  <option value="Aksum University">Aksum University</option>
                  <option value="Madda Walabu University">Madda Walabu University</option>
                  <option value="Mettu University">Mettu University</option>
                  <option value="Assosa University">Assosa University</option>
                  <option value="Semera University">Semera University</option>
                  <option value="Jigjiga University">Jigjiga University</option>
                  <option value="Gambella University">Gambella University</option>
                  <option value="Samara University">Samara University</option>
                  <option value="Jinka University">Jinka University</option>
                  <option value="Ambo University">Ambo University</option>
                  <option value="Raya University">Raya University</option>
                  <option value="Injibara University">Injibara University</option>
                  <option value="Debark University">Debark University</option>
                  <option value="Debre Tabor University">Debre Tabor University</option>
                  <option value="Bonga University">Bonga University</option>
                  <option value="Dembi Dollo University">Dembi Dollo University</option>
                  <option value="Oda Bultum University">Oda Bultum University</option>
                  <option value="Salale University">Salale University</option>
                  <option value="Kebri Dehar University">Kebri Dehar University</option>
                  <option value="Mekdela Amba University">Mekdela Amba University</option>
                  <option value="Ethiopian Civil Service University">Ethiopian Civil Service University</option>
                  <option value="Defense University College">Defense University College</option>
                  <option value="Kotebe Metropolitan University">Kotebe Metropolitan University</option>
                  <option value="Other">Other</option>
                </select>
                {errors.university && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.university.message}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Department <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  {...register('department')}
                  className={`w-full h-12 px-4 border rounded-lg text-base transition-all duration-200 ${
                    errors.department
                      ? 'border-error focus:border-error focus:ring-2 focus:ring-error focus:ring-opacity-20'
                      : 'border-gray-200 focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20'
                  } outline-none`}
                  placeholder="e.g., Computer Science"
                />
                {errors.department && (
                  <p className="mt-2 text-sm text-error flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.department.message}
                  </p>
                )}
              </div>

              {/* Graduation Year */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Graduation Year
                </label>
                <select
                  {...register('graduationYear')}
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg text-base focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20 outline-none transition-all duration-200 bg-white"
                >
                  <option value="">Select year</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Professional Info (Advisors) */}
        {isAdvisor && (
          <>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-black mb-4">Professional Information</h3>

              {/* Department */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-black mb-2">
                  Department
                </label>
                <input
                  type="text"
                  {...register('department')}
                  className="w-full h-12 px-4 border border-gray-200 rounded-lg text-base focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20 outline-none transition-all duration-200"
                  placeholder="e.g., Engineering"
                />
              </div>
            </div>
          </>
        )}

        {/* Bio Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-black mb-4">About</h3>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Bio
            </label>
            <textarea
              {...register('bio')}
              rows={5}
              maxLength={500}
              className={`w-full px-4 py-3 border rounded-lg text-base resize-y min-h-[120px] transition-all duration-200 ${
                errors.bio
                  ? 'border-error focus:border-error focus:ring-2 focus:ring-error focus:ring-opacity-20'
                  : 'border-gray-200 focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20'
              } outline-none`}
              placeholder="Tell us about yourself..."
            />
            <div className="flex items-center justify-between mt-2">
              {errors.bio ? (
                <p className="text-sm text-error flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.bio.message}
                </p>
              ) : (
                <span></span>
              )}
              <span
                className={`text-sm ${
                  characterCount > 500 ? 'text-error' : 'text-gray-400'
                }`}
              >
                {characterCount}/500 characters
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 px-6 border border-gray-200 rounded-lg text-base font-semibold text-black hover:border-blue-accent hover:text-blue-accent transition-all duration-200 flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className="flex-1 h-12 px-6 bg-blue-accent text-white rounded-lg text-base font-semibold hover:bg-blue-hover hover:-translate-y-0.5 hover:shadow-blue transition-all duration-200 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PersonalInfoForm;
