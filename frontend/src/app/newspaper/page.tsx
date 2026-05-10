import { Top } from '@/components/sections/Top';
import { Head } from '@/components/sections/Head';
import { Slider } from '@/components/sections/Slider';
import { News1 } from '@/components/sections/News1';
import { MiddleHead } from '@/components/sections/MiddleHead';
import { getData } from '@/lib/getData';
import { bioSchema } from '@/schemas/bio.schema';
import { projectsArraySchema } from '@/schemas/project.schema';

export default function NewspaperPage() {
  const bio = getData('bio.json', bioSchema);
  const projects = getData('projects.json', projectsArraySchema);
  const featuredProjects = projects.filter(p => p.featured);

  return (
    <div className="newspaper-container animate-entrance">
      <Top />
      <Head />
      <Slider />
      
      {/* WHO IS ZAKARIA Section */}
      <div className="flex flex-row justify-between gap-5 mt-8 mb-8">
        <div className="basis-1/2">
          <div className="font-TimesNewRoman font-extrabold text-5xl pb-3">
            WHO IS {bio.name.toUpperCase()}? <span className="not-italic font-bold">A CLOSER LOOK</span>
          </div>
          <div className="flex flex-row gap-3 text-sm text-justify">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <p>
                  <span className="high">Z</span>
                  akaria Kardache is a {bio.title} with 1+ year of production experience building cloud-native systems at scale. Based in {bio.location.city}, {bio.location.country}, he specializes in {bio.tagline}.
                </p>
                <p>
                  {bio.summary}
                </p>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex flex-col gap-2">
                <p>
                  What sets him apart is his commitment to exploring cutting-edge technologies like Rust, Go, Elixir, and Python. He's not just interested in writing code — he's passionate about crafting well-thought-out, end-to-end solutions.
                </p>
                <p>
                  Currently available for work and open to relocation to {bio.location.relocationTarget}. Fluent in {bio.languages.map(l => l.name).join(', ')}.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 basis-1/2">
          <img src="/IMG/crimeGIFS/a-3.gif" style={{ height: '500px', objectFit: 'cover' }} alt="Developer" />
        </div>
      </div>

      <hr className="border-t-2 border-zinc-800" />
      <MiddleHead />
      <hr className="border-t-2 mb-6 border-zinc-800" />
      
      {/* Featured Projects Section */}
      <div className="mb-8">
        <h1 className="font-TimesNewRoman font-extrabold text-5xl pb-4">FEATURED PROJECTS</h1>
        <div className="grid grid-cols-2 gap-6">
          {featuredProjects.map((project) => (
            <div key={project.id} className="border-2 border-zinc-800 p-6">
              <h2 className="font-Impact text-3xl font-bold uppercase mb-2">{project.name}</h2>
              <p className="font-TimesNewRoman text-lg font-semibold mb-2">{project.tagline}</p>
              <p className="font-EditorialNew text-sm mb-4 text-justify">{project.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {project.stack.slice(0, 6).map((tech) => (
                  <span key={tech} className="bg-zinc-800 text-white px-2 py-1 text-xs font-bold">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="text-xs font-bold">
                {project.highlights.slice(0, 3).map((h, i) => (
                  <div key={i}>• {h}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-t-2 my-6 border-zinc-800" />

      {/* Tech Stack Section */}
      <div>
        <div>
          <h1 style={{ fontSize: '2rem' }}>INSIDE THE DEVELOPER'S TOOLBOX : A Glimpse at the Arsenal Behind Every Line of Code</h1>
        </div>
        <p style={{ fontSize: '1.5rem' }}>Zakaria Kardache, a quiet force in the coding world, prefers craftsmanship over chaos. His toolbox is well-worn, battle-tested, and perfectly organized.</p>
        
        <div className="flex gap-2 mt-4">
          {/* Rust Column */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-center items-center">
              <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/rust/rust-original.svg" alt="Rust" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Rust</span>
            </div>
            <p className="flex"><span style={{ marginTop: '2.5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Advanced</span></p>
            <p className="flex ml-5 text-sm">Microservices, System Programming, Performance-critical applications</p>
          </div>

          {/* Python Column */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-center items-center">
              <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/python/python-original.svg" alt="Python" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Python</span>
            </div>
            <p className="flex"><span style={{ marginTop: '2.5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Advanced</span></p>
            <p className="flex ml-5 text-sm">Automation, Web Scraping, Data Processing, AI/ML</p>
          </div>

          {/* Go Column */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-center items-center">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg" alt="Go" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Go</span>
            </div>
            <p className="flex"><span style={{ marginTop: '2.5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Advanced</span></p>
            <p className="flex ml-5 text-sm">Concurrent Systems, Microservices, Cloud Infrastructure</p>
          </div>

          {/* TypeScript Column */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-center items-center">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-plain.svg" alt="TypeScript" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>TypeScript</span>
            </div>
            <p className="flex"><span style={{ marginTop: '2.5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Advanced</span></p>
            <p className="flex ml-5 text-sm">Next.js, NestJS, Full-Stack Development</p>
          </div>

          {/* Kubernetes Column */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-center items-center">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg" alt="Kubernetes" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>K8s</span>
            </div>
            <p className="flex"><span style={{ marginTop: '2.5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Advanced</span></p>
            <p className="flex ml-5 text-sm">Container Orchestration, Cloud-Native, KCNE Certified</p>
          </div>

          {/* Kafka Column */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex justify-center items-center">
              <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/apachekafka/apachekafka-original.svg" alt="Kafka" style={{ width: '35px', height: '35px', marginRight: '0.5rem', filter: 'grayscale(60%)' }} />
              <span style={{ fontSize: '30px', marginTop: '5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Kafka</span>
            </div>
            <p className="flex"><span style={{ marginTop: '2.5px', fontWeight: 'bold', textTransform: 'uppercase' }}>Advanced</span></p>
            <p className="flex ml-5 text-sm">Event Streaming, Real-time Data Pipelines</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="select-none mt-12">
        <Slider />
        <div className="py-7 font-Canopee text-2xl flex flex-row justify-between px-6">
          <a className="hover:opacity-75 transition-colors duration-300" href="#" target="_blank">
            Zakaria Kardache ©
          </a>
          <div className="flex gap-2">
            <a className="hover:opacity-75 transition-colors duration-300" href="https://linkedin.com/in/ZakariaKardache" target="_blank">LinkedIn</a>
            <span>•</span>
            <a className="hover:opacity-75 transition-colors duration-300" href="https://github.com/kardasch404" target="_blank">GitHub</a>
            <span>•</span>
            <a className="hover:opacity-75 transition-colors duration-300" href="https://xing.com/profile/ZakariaKardache" target="_blank">XING</a>
            <span>•</span>
            <a className="hover:opacity-75 transition-colors duration-300" href="mailto:kardasch.zakaria@outlook.de">Email</a>
          </div>
        </div>
      </div>
    </div>
  );
}
