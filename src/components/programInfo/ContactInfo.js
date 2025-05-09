import React from 'react';
import './ContactInfo.css';

/**
 * ContactInfo Component
 * 
 * Displays comprehensive contact information for the NIH Human Virome Program
 * including program leadership, center leadership, and general inquiries.
 */
function ContactInfo() {
  return (
    <div className="contact-info-container">
      <section className="contact-section main-section">
        <h2>NIH Human Virome Program - Contact Information</h2>
        <p className="lead-text">
          Connect with the NIH Human Virome Program leadership, research centers, and support staff.
        </p>
      </section>

      <section className="contact-section">
        <h3>Program Leadership</h3>
        <div className="contact-table-container">
          <table className="contact-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Organization</th>
                <th>Contact Information</th>
                <th>Role in HVP</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Amanda Melillo, Ph.D.</strong></td>
                <td>Chief, Integrative Biology & Infectious Diseases Branch; Deputy Director, Division of Extramural Research</td>
                <td>National Institute of Dental and Craniofacial Research (NIDCR)</td>
                <td>
                  Phone: 301-529-7217<br/>
                  Email: <a href="mailto:HumanVirome@od.nih.gov">HumanVirome@od.nih.gov</a>
                </td>
                <td>Primary Program Official</td>
              </tr>
              <tr>
                <td><strong>Kumud Singh, Ph.D.</strong></td>
                <td>Chief, Infectious Diseases and Immunology A (IIDA) Branch</td>
                <td>Center for Scientific Review (CSR)</td>
                <td>
                  Phone: 301-827-1002<br/>
                  Email: <a href="mailto:kumud.singh@nih.gov">kumud.singh@nih.gov</a>
                </td>
                <td>Scientific Review Officer</td>
              </tr>
              <tr>
                <td><strong>Gabriel Hidalgo, MBA</strong></td>
                <td>Grants Management Specialist</td>
                <td>National Institute of Dental and Craniofacial Research (NIDCR)</td>
                <td>
                  Phone: 301-827-4630<br/>
                  Email: <a href="mailto:gabriel.hidalgo@nih.gov">gabriel.hidalgo@nih.gov</a>
                </td>
                <td>Grants Management Contact</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="contact-section">
        <h3>Virome Characterization Centers (VCC) Leadership</h3>
        
        <div className="center-subsection">
          <h4>UCLA Human Virome Characterization Center for the Oral-Gut-Brain Axis</h4>
          <div className="contact-table-container">
            <table className="contact-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Organization</th>
                  <th>Role in Center</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Yvonne Hernandez-Kapila, Ph.D.</strong></td>
                  <td>Associate Dean of Research</td>
                  <td>UCLA School of Dentistry</td>
                  <td>Contact Principal Investigator</td>
                </tr>
                <tr>
                  <td><strong>Clara Lajonchere, Ph.D.</strong></td>
                  <td>Deputy Director</td>
                  <td>UCLA Institute for Precision Health</td>
                  <td>Multiple Principal Investigator (MPI)</td>
                </tr>
                <tr>
                  <td><strong>Joseph Petrosino, Ph.D.</strong></td>
                  <td>Professor and Chair</td>
                  <td>Baylor College of Medicine</td>
                  <td>Multiple Principal Investigator (MPI)</td>
                </tr>
                <tr>
                  <td><strong>James Cerhan, M.D., Ph.D.</strong></td>
                  <td>Cancer Epidemiologist</td>
                  <td>Mayo Clinic</td>
                  <td>Multiple Principal Investigator (MPI)</td>
                </tr>
                <tr>
                  <td><strong>Janice Lee, D.D.S., M.D., M.S.</strong></td>
                  <td>Deputy Director for Intramural Clinical Research</td>
                  <td>NIH/NIDCR</td>
                  <td>Multiple Principal Investigator (MPI)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="center-subsection">
          <h4>Vanderbilt-coordinated Virus Characterization Center (V2C2)</h4>
          <div className="contact-table-container">
            <table className="contact-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Organization</th>
                  <th>Role in Center</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Suman Das, Ph.D.</strong></td>
                  <td>Research Associate Professor of Medicine</td>
                  <td>Vanderbilt University Medical Center</td>
                  <td>Administrative Lead PI</td>
                </tr>
                <tr>
                  <td><strong>Ravi Shah, M.D.</strong></td>
                  <td>Professor of Medicine</td>
                  <td>Vanderbilt University Medical Center</td>
                  <td>Multiple Principal Investigator (MPI)</td>
                </tr>
                <tr>
                  <td><strong>Kari North, Ph.D.</strong></td>
                  <td>Associate Dean for Research; Professor of Epidemiology</td>
                  <td>UNC Gillings School of Global Public Health</td>
                  <td>Multiple Principal Investigator (MPI)</td>
                </tr>
                <tr>
                  <td><strong>Susan Fisher-Hoch, M.D.</strong></td>
                  <td>Professor of Epidemiology</td>
                  <td>UTHealth Houston School of Public Health in Brownsville</td>
                  <td>Multiple Principal Investigator (MPI)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="center-subsection">
          <h4>Broad/BWH Virome Investigation in Diverse Populations Center</h4>
          <div className="contact-table-container">
            <table className="contact-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Organization</th>
                  <th>Role in Center</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Pardis Sabeti, M.D., Ph.D.</strong></td>
                  <td>Professor</td>
                  <td>Broad Institute</td>
                  <td>Co-Principal Investigator</td>
                </tr>
                <tr>
                  <td><strong>Daniel Wang, M.D.</strong></td>
                  <td>Physician-Scientist</td>
                  <td>Brigham and Women's Hospital</td>
                  <td>Co-Principal Investigator</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="center-subsection">
          <h4>Stanford VAST Center: Viromes Across Space(s) and Time</h4>
          <div className="contact-table-container">
            <table className="contact-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Organization</th>
                  <th>Role in Center</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Michael Snyder, Ph.D.</strong></td>
                  <td>Professor</td>
                  <td>Stanford University</td>
                  <td>Contact Principal Investigator</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="contact-section">
        <h3>Functional Studies Leadership</h3>
        <div className="contact-table-container">
          <table className="contact-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Position</th>
                <th>Organization</th>
                <th>Project</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Zac Stephens, Ph.D.</strong></td>
                <td>Investigator</td>
                <td>University of Utah</td>
                <td>Antibody targeting of virome</td>
                <td>Principal Investigator</td>
              </tr>
              <tr>
                <td><strong>Caleb Lareau, Ph.D.</strong></td>
                <td>Investigator</td>
                <td>MSKCC</td>
                <td>Human DNA virome characterization</td>
                <td>Principal Investigator</td>
              </tr>
              <tr>
                <td><strong>Kristine Wylie, Ph.D.</strong></td>
                <td>Investigator</td>
                <td>Washington University</td>
                <td>Virome in pregnancy</td>
                <td>Principal Investigator</td>
              </tr>
              <tr>
                <td><strong>Gautam Dantas, Ph.D.</strong></td>
                <td>Investigator</td>
                <td>Washington University</td>
                <td>Virome-microbiome-host interactions</td>
                <td>Principal Investigator</td>
              </tr>
              <tr>
                <td><strong>Timothy Henrich, M.D.</strong></td>
                <td>Investigator</td>
                <td>UCSF</td>
                <td>Deep tissue virome characterization</td>
                <td>Principal Investigator</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="contact-section">
        <h3>General Program Inquiries</h3>
        <div className="general-inquiries">
          <p><strong>Email</strong>: <a href="mailto:HumanVirome@od.nih.gov">HumanVirome@od.nih.gov</a></p>
          <p><strong>Website</strong>: <a href="https://commonfund.nih.gov/humanvirome" target="_blank" rel="noopener noreferrer">https://commonfund.nih.gov/humanvirome</a></p>
          <p><strong>Mailing Address</strong>:</p>
          <address>
            National Institute of Dental and Craniofacial Research<br/>
            National Institutes of Health<br/>
            31 Center Drive, MSC 2190<br/>
            Bethesda, MD 20892-2190
          </address>
        </div>
      </section>

      <section className="contact-section">
        <h3>Connect with the Program</h3>
        <div className="connect-options">
          <div className="connect-option">
            <h4>Subscribe to HVP Listserv</h4>
            <p>Visit the <a href="https://commonfund.nih.gov/humanvirome" target="_blank" rel="noopener noreferrer">Human Virome Program website</a> and click "Subscribe to our listserv"</p>
          </div>
          
          <div className="connect-option">
            <h4>Webinar Recordings</h4>
            <p>Available on the <a href="https://commonfund.nih.gov/humanvirome" target="_blank" rel="noopener noreferrer">Human Virome Program website</a></p>
          </div>
        </div>
        
        <p className="contact-info-note">
          <em>Contact information is current as of May 2025. For the most up-to-date contact information, please visit the <a href="https://commonfund.nih.gov/humanvirome" target="_blank" rel="noopener noreferrer">NIH Human Virome Program website</a>.</em>
        </p>
      </section>
    </div>
  );
}

export default ContactInfo;