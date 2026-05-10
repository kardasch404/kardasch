import { Slider } from '@/components/sections/Slider';

export function Footer() {
  return (
    <div className="select-none">
      <Slider />
      <div className="py-7 font-Canopee text-2xl flex flex-row justify-between px-6">
        <a
          className="hover:opacity-75 transition-colors duration-300"
          href="#"
          target="_blank"
        >
          Zakaria Kardache ©
        </a>

        <div className="flex gap-2">
          <a
            className="hover:opacity-75 transition-colors duration-300"
            href="https://linkedin.com/in/ZakariaKardache"
            target="_blank"
          >
            LinkedIn
          </a>
          <span>•</span>
          <a
            className="hover:opacity-75 transition-colors duration-300"
            href="https://github.com/kardasch404"
            target="_blank"
          >
            GitHub
          </a>
          <span>•</span>
          <a
            className="hover:opacity-75 transition-colors duration-300"
            href="https://xing.com/profile/ZakariaKardache"
            target="_blank"
          >
            XING
          </a>
          <span>•</span>
          <a
            className="hover:opacity-75 transition-colors duration-300"
            href="mailto:kardasch.zakaria@outlook.de"
          >
            Email
          </a>
        </div>
      </div>
    </div>
  );
}
