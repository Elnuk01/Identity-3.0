import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Registration } from '../types';
import { submitRegistration } from '../utils';
import { User, Mail, Phone, Home, Calendar, Users, Check, Flame, Heart, ExternalLink, Award } from 'lucide-react';
import Countdown from './Countdown';

interface RegistrationFormProps {
  darkMode: boolean;
  onSuccess: (reg: Registration) => void;
}

const AGE_RANGES = [
  '10 - 14',
  '15 - 19',
  '20 - 24',
  '25 - 29',
  '30 and above'
];

const GENDERS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' }
];

const VOLUNTEER_ROLES = [
  { value: 'usher', label: 'Usher' },
  { value: 'media', label: 'Media' },
  { value: 'welfare', label: 'Welfare' },
  { value: 'singer', label: 'Singer / Vocalist' },
  { value: 'instrumentalist', label: 'Instrumentalist' },
  { value: 'prayer', label: 'Prayer Team' }
];

export default function RegistrationForm({ darkMode, onSuccess }: RegistrationFormProps) {
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Form states
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [churchName, setChurchName] = useState<string>('');
  const [ageRange, setAgeRange] = useState<string>('');
  const [sex, setSex] = useState<string>('');
  const [selectedVolunteers, setSelectedVolunteers] = useState<string[]>([]);
  const [isVolunteer, setIsVolunteer] = useState<boolean | null>(null);

  // Validation
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    validateForm();
  }, [fullName, email, phoneNumber, churchName, ageRange, sex, selectedVolunteers, isVolunteer]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Name must be at least 3 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required.';
    } else if (phoneNumber.trim().replace(/\D/g, '').length < 8) {
      newErrors.phoneNumber = 'Please provide a valid phone number.';
    }

    if (!ageRange) {
      newErrors.ageRange = 'Please select your age range.';
    }

    if (!sex) {
      newErrors.sex = 'Please select your sex.';
    }

    if (isVolunteer === null) {
      newErrors.isVolunteer = 'Please choose if you would like to volunteer.';
    } else if (isVolunteer && selectedVolunteers.length === 0) {
      newErrors.selectedVolunteers = 'Please choose at least one volunteering position.';
    }

    setErrors(newErrors);
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleVolunteerToggle = (role: string) => {
    setSelectedVolunteers(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Touch everything to trigger alerts
    const allFields = ['fullName', 'email', 'phoneNumber', 'ageRange', 'sex', 'isVolunteer', 'selectedVolunteers'];
    const touchedAll: { [key: string]: boolean } = {};
    allFields.forEach(f => {
      touchedAll[f] = true;
    });
    setTouched(prev => ({ ...prev, ...touchedAll }));

    if (Object.keys(errors).length > 0) {
      setErrorMessage('Please correct all highlighted fields before submitting.');
      return;
    }

    setSubmitting(true);

    const payload = {
      fullName: fullName.trim(),
      email: email.trim(),
      emailAddress: email.trim(),
      phoneNumber: phoneNumber.trim(),
      churchName: churchName.trim(),
      ageRange,
      sex,
      volunteerOptions: isVolunteer ? selectedVolunteers : []
    };

    try {
      const response = await submitRegistration(payload);
      if (response.success && response.registration) {
        onSuccess(response.registration);
      } else {
        setErrorMessage(response.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="registration-section"
      className={`relative min-h-screen py-16 flex items-center justify-center transition-colors duration-300 ${
        darkMode ? 'bg-zinc-950 text-white' : 'bg-gradient-to-b from-slate-50 to-zinc-100 text-zinc-900'
      }`}
    >
      {/* Background elegant lighting glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-xl mx-auto px-4 sm:px-6 relative z-10 w-full">
        {/* Registration form card wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`p-6 sm:p-10 rounded-3xl border shadow-xl ${
            darkMode
              ? 'bg-zinc-900/90 border-zinc-800/80 backdrop-blur-md shadow-blue-500/5'
              : 'bg-white border-zinc-200/80 shadow-zinc-200/50'
          }`}
        >
          {/* Countdown timer */}
          <Countdown darkMode={darkMode} />

          {/* Decorative Tagline */}
          <div className="text-center mb-6">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black tracking-widest uppercase bg-blue-500/10 text-blue-500 border border-blue-500/20 mb-3 select-none"
            >
              <Flame className="w-3 h-3 text-blue-500" />
              CONVERGE 2026 REGISTRATION
            </span>
            <h1
              className="font-display font-black text-2xl sm:text-3xl uppercase tracking-tighter select-none"
            >
              Ready to{' '}
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Converge?
              </span>
            </h1>
            <p className={`text-xs mt-1.5 font-medium ${darkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
              Fill your registration details below to book your complimentary pass.
            </p>
          </div>

          <div className="h-px bg-zinc-200/50 dark:bg-zinc-800/50 w-full mb-6" />

          {errorMessage && (
            <div className="p-4.5 mb-6 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center gap-2">
              <span>⚠️</span>
              <p>{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            
            {/* Full Name field */}
            <div>
              <label id="lbl-fullname" className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  className={`w-full py-3.5 pl-11 pr-4 rounded-xl text-sm font-sans transition-colors border ${
                    touched.fullName && errors.fullName
                      ? 'border-rose-500 bg-rose-500/5 focus:outline-none'
                      : darkMode
                        ? 'bg-zinc-950 border-zinc-805 text-white focus:border-blue-500 focus:outline-none'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-950 focus:border-blue-500 focus:outline-none'
                  }`}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
              </div>
              {touched.fullName && errors.fullName && (
                <p className="text-rose-500 text-xs font-sans mt-1.5">{errors.fullName}</p>
              )}
            </div>

            {/* Email Address field */}
            <div>
              <label id="lbl-email" className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  className={`w-full py-3.5 pl-11 pr-4 rounded-xl text-sm font-sans transition-colors border ${
                    touched.email && errors.email
                      ? 'border-rose-500 bg-rose-500/5 focus:outline-none'
                      : darkMode
                        ? 'bg-zinc-950 border-zinc-805 text-white focus:border-blue-500 focus:outline-none'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-950 focus:border-blue-500 focus:outline-none'
                  }`}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
              </div>
              {touched.email && errors.email && (
                <p className="text-rose-500 text-xs font-sans mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Phone Number field */}
            <div>
              <label id="lbl-phone" className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onBlur={() => handleBlur('phoneNumber')}
                  className={`w-full py-3.5 pl-11 pr-4 rounded-xl text-sm font-sans transition-colors border ${
                    touched.phoneNumber && errors.phoneNumber
                      ? 'border-rose-500 bg-rose-500/5 focus:outline-none'
                      : darkMode
                        ? 'bg-zinc-950 border-zinc-805 text-white focus:border-blue-500 focus:outline-none'
                        : 'bg-zinc-50 border-zinc-300 text-zinc-950 focus:border-blue-500 focus:outline-none'
                  }`}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Phone className="w-4 h-4" />
                </div>
              </div>
              {touched.phoneNumber && errors.phoneNumber && (
                <p className="text-rose-500 text-xs font-sans mt-1.5">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Name of church field */}
            <div>
              <label id="lbl-church" className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                Name of Church <span className="text-zinc-400 font-normal lowercase italic">(Optional)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="What is the name of your church?"
                  value={churchName}
                  onChange={(e) => setChurchName(e.target.value)}
                  className={`w-full py-3.5 pl-11 pr-4 rounded-xl text-sm font-sans transition-colors border ${
                    darkMode
                      ? 'bg-zinc-950 border-zinc-805 text-white focus:border-blue-500 focus:outline-none'
                      : 'bg-zinc-50 border-zinc-300 text-zinc-950 focus:border-blue-500 focus:outline-none'
                  }`}
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                  <Home className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Age range selection */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                Age Range <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AGE_RANGES.map((range) => {
                  const selected = ageRange === range;
                  return (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setAgeRange(range)}
                      className={`py-3 px-4 text-xs font-semibold rounded-xl text-center border cursor-pointer transition-all duration-200 ${
                        selected
                          ? 'border-blue-500 bg-blue-500/10 text-blue-500'
                          : darkMode
                            ? 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-755 hover:text-white'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:text-zinc-950'
                      }`}
                    >
                      {range}
                    </button>
                  );
                })}
              </div>
              {touched.ageRange && errors.ageRange && (
                <p className="text-rose-500 text-xs font-sans mt-1.5">{errors.ageRange}</p>
              )}
            </div>

            {/* Sex selection */}
            <div>
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                Sex <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {GENDERS.map((g) => {
                  const selected = sex === g.value;
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setSex(g.value)}
                      className={`py-3.5 px-6 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border cursor-pointer transition-all duration-200 ${
                        selected
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 font-bold'
                          : darkMode
                            ? 'bg-zinc-950/40 border-zinc-805 text-zinc-400 hover:border-zinc-700 hover:text-white'
                            : 'bg-zinc-50 border-zinc-205 text-zinc-700 hover:border-zinc-300 hover:text-zinc-950'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                      {g.label}
                    </button>
                  );
                })}
              </div>
              {touched.sex && errors.sex && (
                <p className="text-rose-500 text-xs font-sans mt-1.5">{errors.sex}</p>
              )}
            </div>

            {/* Would you like to volunteer selection */}
            <div className="pt-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2.5">
                Would you like to volunteer? <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4Type text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsVolunteer(true);
                  }}
                  className={`py-3.5 px-6 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border cursor-pointer transition-all duration-200 ${
                    isVolunteer === true
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold'
                      : darkMode
                        ? 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-zinc-300 hover:text-zinc-950'
                  }`}
                >
                  {isVolunteer === true && <Check className="w-3.5 h-3.5" />}
                  Yes, I want to volunteer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVolunteer(false);
                    setSelectedVolunteers([]);
                  }}
                  className={`py-3.5 px-6 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 border cursor-pointer transition-all duration-200 ${
                    isVolunteer === false
                      ? 'border-zinc-500 bg-zinc-500/10 text-zinc-650 dark:text-zinc-350 font-bold'
                      : darkMode
                        ? 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                        : 'bg-zinc-50 border-zinc-205 text-zinc-700 hover:border-zinc-300 hover:text-zinc-950'
                  }`}
                >
                  {isVolunteer === false && <Check className="w-3.5 h-3.5" />}
                  No, just attending
                </button>
              </div>
              {touched.isVolunteer && errors.isVolunteer && (
                <p className="text-rose-500 text-xs font-sans mt-1.5">{errors.isVolunteer}</p>
              )}

              {/* Sub Volunteer Roles Selection Checkboxes on YES */}
              {isVolunteer === true && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 mt-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 rounded-2xl p-4.5"
                >
                  <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-blue-500" />
                    Select Volunteer Options <span className="text-zinc-400">(Choose one or more)</span>:
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {VOLUNTEER_ROLES.map((role) => {
                      const active = selectedVolunteers.includes(role.value);
                      return (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => handleVolunteerToggle(role.value)}
                          className={`p-3 rounded-xl border flex items-center justify-between text-left cursor-pointer transition-all duration-150 ${
                            active
                              ? 'border-indigo-500/60 bg-indigo-500/5 text-indigo-500 dark:text-indigo-400 font-bold'
                              : darkMode
                                ? 'bg-zinc-900 border-zinc-800/80 text-zinc-450 hover:border-zinc-700'
                                : 'bg-white border-zinc-200 text-zinc-650 hover:border-zinc-350'
                          }`}
                        >
                          <span className="text-xs">{role.label}</span>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            active
                              ? 'bg-indigo-500 border-indigo-500 text-white'
                              : 'bg-transparent border-zinc-300 dark:border-zinc-700'
                          }`}>
                            {active && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {touched.selectedVolunteers && errors.selectedVolunteers && (
                    <p className="text-rose-500 text-xs font-sans mt-1">{errors.selectedVolunteers}</p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-mono text-xs font-bold py-4 rounded-2xl shadow-xl shadow-blue-500/15 tracking-widest uppercase transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-98 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Booking your spot...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4 fill-white animate-pulse" />
                    <span>REGISTER & UNLOCK TICKET</span>
                  </>
                )}
              </button>
            </div>

          </form>
        </motion.div>



      </div>
    </section>
  );
}
