// GDPR technical and organizational measures page.
function GdprPage() {
  const controls = [
    {
      title: 'Pseudonymisation and Encryption',
      article: 'Art. 32 para. 1 point a GDPR',
      body: 'Pseudonymisation contains measures that enable one to process personal data in such a manner that the personal data can no longer be attributed to a specific data subject without the use of additional information, provided that this additional information is stored separately and is subject to appropriate technical and organizational measures. Encryption contains measures that enable one to convert clearly legible information into an illegible string by means of a cryptographic process.',
      items: [
        'Stored data is encrypted where appropriate, including any backup copies of the data.',
      ],
    },
    {
      title: 'Ongoing confidentiality, integrity, availability and resilience',
      article: 'Art. 32 para. 1 point b GDPR',
      body: 'Confidentiality and integrity are ensured by the secure processing of personal data, including protection against unauthorized or unlawful processing. Integrity and availability are supported by measures to protect against accidental loss, destruction or damage.',
      subsections: [
        {
          title: 'Confidentiality',
          groups: [
            {
              title: 'Physical access control',
              intro: 'The processor operates as a cloud-native organization without proprietary data centers. Physical infrastructure security is ensured by the sub-processors under their respective certifications. The following measures apply to the processor’s own operations:',
              items: [
                'Physical access control systems.',
                'Definition of authorized persons; management and documentation of individual authorizations.',
                'Screen lock policies and clean desk practices.',
                'Remote wipe capability for lost or stolen devices.',
              ],
            },
            {
              title: 'System/Electronic access control',
              intro: 'Measures that prevent data processing systems from being used without authorization.',
              items: [
                'User authentication by simple authentication methods using username and password, including two-factor authentication where adequate.',
                'Secure transmission of credentials using TLS.',
                'Automatic account locking and suspended inactive sessions.',
                'Guidelines for handling passwords and certificates.',
                'Definition of authorized persons and management of authentication methods.',
                'Access control to infrastructure hosted by cloud service providers.',
                'In-time revocation of access for people who no longer need access or leave the company.',
                'Automated alerting on illegal attempts to access logging systems directly or indirectly connected to personal data.',
                'Unique credentials per user.',
                'Use of jump servers to restrict access where adequate.',
              ],
            },
            {
              title: 'Internal access control',
              intro: 'Measures that ensure persons entitled to use a data processing system have access only to the data to which they have a right of access, and that personal data cannot be read, copied, modified or removed without authorization during processing, use or storage.',
              items: [
                'Automatic and manual locking.',
                'Access right management.',
                'Authorization concepts, access restrictions, need-to-know principles and management of individual access rights.',
              ],
            },
            {
              title: 'Isolation/Separation control',
              intro: 'Measures to ensure that data collected for different purposes can be processed, stored, amended, deleted and transmitted separately.',
              items: [
                'Network separation.',
                'Segregation of responsibilities and duties.',
                'Documented procedures and applications for separation.',
              ],
            },
            {
              title: 'Job control',
              intro: 'Measures that ensure commissioned processing of personal data strictly corresponds to the instructions of the principal.',
              items: [
                'Training and confidentiality agreements for internal and external staff.',
                'Information security assessments for vendors and partners.',
              ],
            },
          ],
        },
        {
          title: 'Integrity',
          groups: [
            {
              title: 'Data transmission control',
              intro: 'Measures that ensure personal data cannot be read, copied, modified or removed without authorization during electronic transmission or transport, and that it is possible to check and establish to which bodies personal data transfer by transmission facilities is envisaged.',
              items: [
                'Secure transmission between client and server and to external systems using industry-standard encryption.',
                'Secure network interconnections ensured by firewalls, anti-virus programs, routine software patching and related safeguards.',
                'Logging of transmissions from IT systems that store or process personal data.',
              ],
            },
            {
              title: 'Data input control',
              intro: 'Measures that ensure it is possible to check and establish whether and by whom personal data has been input into data processing systems, modified or removed.',
              items: [
                'Logging authentication and monitored logical system access.',
                'Logging data access, including access, modification, entry and deletion of data.',
                'Documentation of data entry rights and partial logging of security-related entries.',
              ],
            },
          ],
        },
        {
          title: 'Availability and resilience of processing systems and services',
          body: 'Availability includes measures that ensure personal data is protected from accidental destruction or loss due to internal or external influences. Resilience of processing systems and services includes measures that ensure the ability to withstand attacks or quickly restore systems to working order after an attack.',
          items: [
            'Backup concept.',
            'Implementation of transport policies.',
            'Protection of stored backup media.',
          ],
        },
      ],
    },
    {
      title: 'Restoring availability and access in a timely manner',
      article: 'Art. 32 para. 1 point c GDPR',
      body: 'Organizational measures that ensure the possibility to quickly restore the system or data in the event of a physical or technical incident.',
      items: ['Continuity planning, including Recovery Time Objective.'],
    },
    {
      title: 'Regular testing, assessing and evaluating effectiveness',
      article: 'Art. 32 para. 1 point d GDPR',
      body: 'Organizational measures that ensure the regular review and assessment of technical and organizational measures.',
      items: [
        'Testing of emergency equipment.',
        'Documentation of interfaces and personal data fields.',
        'Internal assessments.',
      ],
    },
  ];

  const renderList = (items) => (
    <ul className="gdpr-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );

  const renderGroup = (group) => (
    <div className="gdpr-control-group" key={group.title}>
      <h4>{group.title}</h4>
      {group.intro && <p>{group.intro}</p>}
      {group.body && <p>{group.body}</p>}
      {group.items && renderList(group.items)}
    </div>
  );

  const renderSubsection = (subsection) => (
    <div className="gdpr-subsection" key={subsection.title}>
      <h3>{subsection.title}</h3>
      {subsection.body && <p>{subsection.body}</p>}
      {subsection.items && renderList(subsection.items)}
      {subsection.groups && subsection.groups.map(renderGroup)}
    </div>
  );

  return (
    <LegalShell>
      <div className="gdpr-page-copy">
        <p className="legal-eyebrow">Annex III of Exhibit C</p>
        <h1>Technical and Organizational Measures</h1>
        <p className="legal-meta">GDPR security measures under Article 32</p>
        <p className="gdpr-intro">
          This annex describes technical and organizational measures used to protect personal data, including measures for pseudonymisation, encryption, confidentiality, integrity, availability, resilience and regular effectiveness reviews.
        </p>

        <div className="gdpr-toc" aria-label="Page overview">
          {controls.map((control, index) => (
            <a href={`#control-${index + 1}`} key={control.title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {control.title}
            </a>
          ))}
        </div>

        <div className="gdpr-controls">
          {controls.map((control, index) => (
            <section className="gdpr-card" id={`control-${index + 1}`} key={control.title}>
              <div className="gdpr-card-heading">
                <span className="gdpr-number">{index + 1}</span>
                <div>
                  <h2>{control.title}</h2>
                  {control.article && <p>{control.article}</p>}
                </div>
              </div>
              {control.body && <p>{control.body}</p>}
              {control.items && renderList(control.items)}
              {control.subsections && control.subsections.map(renderSubsection)}
            </section>
          ))}
        </div>
      </div>
    </LegalShell>
  );
}

window.GdprPage = GdprPage;
ReactDOM.createRoot(document.getElementById('root')).render(<GdprPage />);
