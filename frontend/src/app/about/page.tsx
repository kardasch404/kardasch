import { getData } from '@/lib/getData';
import { bioSchema } from '@/schemas/bio.schema';

export default function AboutPage() {
  const bio = getData('bio.json', bioSchema);

  return (
    <div className="mt-8">
      <h1 className="font-OldLondon text-center text-8xl font-bold text-themeOrange">
        ABOUT THE AUTHOR
      </h1>

      <div className="mt-8 border-4 border-black p-8">
        <h2 className="font-Impact text-5xl font-bold uppercase">{bio.name}</h2>
        <p className="font-TimesNewRoman text-2xl font-medium mt-2">{bio.title}</p>
        
        <div className="mt-6 border-t-2 border-black pt-6">
          <div className="font-EditorialNew text-xl leading-relaxed">
            <p className="high">A</p>
            <p className="text-justify">{bio.bio}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 border-4 border-black p-8">
        <h3 className="font-Impact text-3xl font-bold uppercase mb-6">CONTACT INFORMATION</h3>
        <div className="space-y-4 font-TimesNewRoman text-lg">
          <div className="border-b-2 border-black pb-2">
            <strong className="font-bold">EMAIL:</strong>{' '}
            <a href={`mailto:${bio.email}`} className="text-themeOrange hover:underline">
              {bio.email}
            </a>
          </div>
          {bio.github && (
            <div className="border-b-2 border-black pb-2">
              <strong className="font-bold">GITHUB:</strong>{' '}
              <a
                href={bio.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-themeOrange hover:underline"
              >
                {bio.github}
              </a>
            </div>
          )}
          {bio.linkedin && (
            <div className="border-b-2 border-black pb-2">
              <strong className="font-bold">LINKEDIN:</strong>{' '}
              <a
                href={bio.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-themeOrange hover:underline"
              >
                {bio.linkedin}
              </a>
            </div>
          )}
          {bio.location && (
            <div className="border-b-2 border-black pb-2">
              <strong className="font-bold">LOCATION:</strong> {bio.location}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
