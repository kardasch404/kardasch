import { ContactForm } from '@/components/forms/ContactForm';

export default function ContactPage() {
  return (
    <div className="mt-8">
      <h1 className="font-OldLondon text-center text-8xl font-bold text-themeOrange">
        GET IN TOUCH
      </h1>

      <div className="mx-auto mt-8 max-w-3xl border-4 border-black p-8">
        <div className="border-b-4 border-black pb-6 mb-6">
          <p className="font-EditorialNew text-xl leading-relaxed text-justify">
            <span className="high">H</span>
            ave a question or want to work together? Fill out the form below and I'll get back to you as soon as possible. 
            Whether you're looking for collaboration, have a project in mind, or just want to say hello, I'd love to hear from you.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
