export function News1() {
  return (
    <div className="flex flex-row justify-between gap-5 mt-8 mb-8">
      <div className="basis-1/2">
        <div className="font-TimesNewRoman font-extrabold text-5xl pb-3">
          WHO IS JYOTIRADITYA? <span className="not-italic font-bold">A CLOSER LOOK</span>
        </div>
        <div className="flex flex-row gap-3 text-sm text-justify">
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <p>
                <span className="high">J</span>
                yotiraditya Kuanar is a passionate full-stack developer who thrives on building projects from the ground up using a wide range of technologies. He enjoys the challenge of creating complete systems — handling everything from backend infrastructure to frontend interfaces — and believes in learning by doing.
              </p>
              <p>
                What sets him apart is his commitment to exploring unconventional tech stacks and his natural drive to build projects entirely from scratch. He's not just interested in writing code — he's passionate about crafting well-thought-out, end-to-end solutions.
              </p>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <p>
                Although he hasn't formally worked in the cybersecurity domain, Jyotiraditya is a deeply motivated cybersecurity enthusiast. The principles of security, precision, and resilience heavily influence his development mindset, and continue to inspire the projects he takes on.
              </p>
              <p>
                What sets him apart is his commitment to exploring unconventional tech stacks and his natural drive to build projects entirely from scratch. He's not just interested in writing code — he's passionate about crafting well-thought-out, end-to-end solutions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 basis-1/2">
        <img src="/IMG/crimeGIFS/a-3.gif" style={{ height: '500px', objectFit: 'cover' }} alt="Developer" />
      </div>
    </div>
  );
}
