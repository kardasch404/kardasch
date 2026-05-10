'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema, type ContactFormData } from '@/schemas/contact.schema';
import { useAppDispatch, useAppSelector } from '@/store/hooks/typed';
import { setContactStatus, setContactError } from '@/store/slices/contactSlice';

export function ContactForm() {
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.contact);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    dispatch(setContactStatus('loading'));
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log('Form data:', data);
      
      dispatch(setContactStatus('success'));
      reset();
    } catch (err) {
      dispatch(setContactStatus('error'));
      dispatch(setContactError('Failed to send message. Please try again.'));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="mb-2 block font-TimesNewRoman text-lg font-bold uppercase">
          Name
        </label>
        <input
          id="name"
          {...register('name')}
          className="w-full border-4 border-black bg-white px-4 py-3 font-EditorialNew text-lg focus:outline-none focus:ring-4 focus:ring-themeOrange"
        />
        {errors.name && (
          <p className="mt-2 font-TimesNewRoman text-sm font-bold text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block font-TimesNewRoman text-lg font-bold uppercase">
          Email
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full border-4 border-black bg-white px-4 py-3 font-EditorialNew text-lg focus:outline-none focus:ring-4 focus:ring-themeOrange"
        />
        {errors.email && (
          <p className="mt-2 font-TimesNewRoman text-sm font-bold text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="subject" className="mb-2 block font-TimesNewRoman text-lg font-bold uppercase">
          Subject
        </label>
        <input
          id="subject"
          {...register('subject')}
          className="w-full border-4 border-black bg-white px-4 py-3 font-EditorialNew text-lg focus:outline-none focus:ring-4 focus:ring-themeOrange"
        />
        {errors.subject && (
          <p className="mt-2 font-TimesNewRoman text-sm font-bold text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-2 block font-TimesNewRoman text-lg font-bold uppercase">
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          {...register('message')}
          className="w-full border-4 border-black bg-white px-4 py-3 font-EditorialNew text-lg focus:outline-none focus:ring-4 focus:ring-themeOrange"
        />
        {errors.message && (
          <p className="mt-2 font-TimesNewRoman text-sm font-bold text-red-600">{errors.message.message}</p>
        )}
      </div>

      {status === 'success' && (
        <div className="border-4 border-green-600 bg-green-100 p-4">
          <p className="font-TimesNewRoman font-bold text-green-800">MESSAGE SENT SUCCESSFULLY!</p>
        </div>
      )}
      {status === 'error' && (
        <div className="border-4 border-red-600 bg-red-100 p-4">
          <p className="font-TimesNewRoman font-bold text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full border-4 border-black bg-black px-8 py-4 font-TimesNewRoman text-xl font-bold text-white transition-all hover:bg-themeOrange hover:border-themeOrange disabled:opacity-50"
      >
        {status === 'loading' ? 'SENDING...' : 'SEND MESSAGE'}
      </button>
    </form>
  );
}
