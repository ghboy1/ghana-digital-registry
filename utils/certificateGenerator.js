const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const certificateGenerator = {
  // Generate Birth Certificate
  generateBirthCertificate: (birthData, res) => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="birth-certificate-${birthData.registration_number}.pdf"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Add Ghana Coat of Arms (placeholder - you can add an actual image)
        this.addHeader(doc, 'BIRTH CERTIFICATE');

        // Certificate Border
        this.addCertificateBorder(doc);

        // Official Title
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#006B3F')
           .text('REPUBLIC OF GHANA', 50, 120, { align: 'center' });

        doc.fontSize(14)
           .text('BIRTH CERTIFICATE', 50, 140, { align: 'center' });

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#000000')
           .text('Issued under the Registration of Births and Deaths Act, 2020', 50, 160, { align: 'center' });

        // Registration Number
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(`Registration Number: ${birthData.registration_number}`, 50, 200);

        // Child Information Section
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text('CHILD INFORMATION', 50, 230)
           .moveDown(0.5);

        doc.font('Helvetica')
           .text(`Full Name: ${birthData.child_first_name} ${birthData.child_last_name} ${birthData.child_other_names || ''}`, 50)
           .text(`Date of Birth: ${this.formatDate(birthData.date_of_birth)}`, 50)
           .text(`Time of Birth: ${birthData.time_of_birth || 'Not specified'}`, 50)
           .text(`Place of Birth: ${birthData.place_of_birth}`, 50)
           .text(`Gender: ${birthData.gender}`, 50)
           .text(`Weight at Birth: ${birthData.weight_kg ? birthData.weight_kg + ' kg' : 'Not recorded'}`, 50);

        // Parents Information
        doc.moveDown(1)
           .font('Helvetica-Bold')
           .text('PARENTS INFORMATION', 50)
           .moveDown(0.5);

        doc.font('Helvetica')
           .text(`Mother's Name: ${birthData.mother_first_name} ${birthData.mother_last_name}`, 50)
           .text(`Mother's Ghana Card: ${birthData.mother_national_id || 'Not provided'}`, 50)
           .text(`Father's Name: ${birthData.father_first_name} ${birthData.father_last_name}`, 50)
           .text(`Father's Ghana Card: ${birthData.father_national_id || 'Not provided'}`, 50);

        // Registration Details
        doc.moveDown(1)
           .font('Helvetica-Bold')
           .text('REGISTRATION DETAILS', 50)
           .moveDown(0.5);

        doc.font('Helvetica')
           .text(`Date of Registration: ${this.formatDate(birthData.registration_date)}`, 50)
           .text(`Informant: ${birthData.informant_name || 'Not specified'}`, 50)
           .text(`Relationship: ${birthData.informant_relationship || 'Not specified'}`, 50);

        // Official Stamp Area
        doc.moveDown(3)
           .font('Helvetica-Bold')
           .text('OFFICIAL STAMP', 300, doc.y)
           .moveDown(2);

        doc.font('Helvetica')
           .fontSize(9)
           .text('This is to certify that the above is a true copy of the original entry in the Register of Births.', 50, doc.y, { align: 'center' })
           .moveDown(0.5)
           .text('Issued by: Ghana Birth and Death Registry', 50, { align: 'center' })
           .text(`Date Issued: ${this.formatDate(new Date())}`, 50, { align: 'center' });

        // Security Features
        this.addSecurityFeatures(doc);

        doc.end();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Generate Death Certificate
  generateDeathCertificate: (deathData, res) => {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ 
          size: 'A4', 
          margins: { top: 50, bottom: 50, left: 50, right: 50 }
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="death-certificate-${deathData.registration_number}.pdf"`);

        // Pipe PDF to response
        doc.pipe(res);

        // Add Header
        this.addHeader(doc, 'DEATH CERTIFICATE');

        // Certificate Border
        this.addCertificateBorder(doc);

        // Official Title
        doc.fontSize(16)
           .font('Helvetica-Bold')
           .fillColor('#006B3F')
           .text('REPUBLIC OF GHANA', 50, 120, { align: 'center' });

        doc.fontSize(14)
           .text('DEATH CERTIFICATE', 50, 140, { align: 'center' });

        doc.fontSize(10)
           .font('Helvetica')
           .fillColor('#000000')
           .text('Issued under the Registration of Births and Deaths Act, 2020', 50, 160, { align: 'center' });

        // Registration Number
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text(`Registration Number: ${deathData.registration_number}`, 50, 200);

        // Deceased Information Section
        doc.fontSize(11)
           .font('Helvetica-Bold')
           .text('DECEASED INFORMATION', 50, 230)
           .moveDown(0.5);

        doc.font('Helvetica')
           .text(`Full Name: ${deathData.deceased_first_name} ${deathData.deceased_last_name} ${deathData.deceased_other_names || ''}`, 50)
           .text(`Date of Death: ${this.formatDate(deathData.date_of_death)}`, 50)
           .text(`Time of Death: ${deathData.time_of_death || 'Not specified'}`, 50)
           .text(`Place of Death: ${deathData.place_of_death}`, 50)
           .text(`Gender: ${deathData.gender}`, 50)
           .text(`Age at Death: ${deathData.age_at_death ? deathData.age_at_death + ' years' : 'Not specified'}`, 50)
           .text(`Nationality: ${deathData.nationality || 'Ghanaian'}`, 50)
           .text(`Occupation: ${deathData.occupation || 'Not specified'}`, 50)
           .text(`Marital Status: ${deathData.marital_status || 'Not specified'}`, 50);

        // Cause of Death
        if (deathData.cause_of_death) {
          doc.moveDown(0.5)
             .font('Helvetica-Bold')
             .text('CAUSE OF DEATH', 50)
             .moveDown(0.5);

          doc.font('Helvetica')
             .text(deathData.cause_of_death, 50);
        }

        // Informant Details
        doc.moveDown(1)
           .font('Helvetica-Bold')
           .text('INFORMANT DETAILS', 50)
           .moveDown(0.5);

        doc.font('Helvetica')
           .text(`Informant Name: ${deathData.informant_name || 'Not specified'}`, 50)
           .text(`Relationship: ${deathData.informant_relationship || 'Not specified'}`, 50)
           .text(`Contact: ${deathData.informant_contact || 'Not provided'}`, 50);

        // Registration Details
        doc.moveDown(1)
           .font('Helvetica-Bold')
           .text('REGISTRATION DETAILS', 50)
           .moveDown(0.5);

        doc.font('Helvetica')
           .text(`Date of Registration: ${this.formatDate(deathData.registration_date)}`, 50);

        // Official Stamp Area
        doc.moveDown(3)
           .font('Helvetica-Bold')
           .text('OFFICIAL STAMP', 300, doc.y)
           .moveDown(2);

        doc.font('Helvetica')
           .fontSize(9)
           .text('This is to certify that the above is a true copy of the original entry in the Register of Deaths.', 50, doc.y, { align: 'center' })
           .moveDown(0.5)
           .text('Issued by: Ghana Birth and Death Registry', 50, { align: 'center' })
           .text(`Date Issued: ${this.formatDate(new Date())}`, 50, { align: 'center' });

        // Security Features
        this.addSecurityFeatures(doc);

        doc.end();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  // Helper function to add header
  addHeader: (doc, title) => {
    // Ghana flag colors background
    doc.rect(0, 0, doc.page.width, 80)
       .fill('#006B3F'); // Green

    doc.rect(0, 80, doc.page.width, 10)
       .fill('#FCD116'); // Yellow

    doc.rect(0, 90, doc.page.width, 10)
       .fill('#CE1126'); // Red

    // Title in white on green background
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text(title, 0, 30, { align: 'center' });

    doc.fontSize(10)
       .text('Birth and Death Registry - Republic of Ghana', 0, 55, { align: 'center' });
  },

  // Helper function to add certificate border
  addCertificateBorder: (doc) => {
    const borderWidth = 2;
    const borderColor = '#006B3F';
    
    doc.rect(40, 100, doc.page.width - 80, doc.page.height - 150)
       .lineWidth(borderWidth)
       .strokeColor(borderColor)
       .stroke();
  },

  // Helper function to add security features
  addSecurityFeatures: (doc) => {
    // Watermark
    doc.opacity(0.1)
       .fontSize(60)
       .fillColor('#006B3F')
       .text('OFFICIAL CERTIFICATE', 50, 300, { 
         align: 'center',
         rotation: 45 
       })
       .opacity(1);

    // Security text at bottom
    doc.fontSize(8)
       .fillColor('#666666')
       .text('This is an official document. Unauthorized reproduction is prohibited.', 50, doc.page.height - 40, { align: 'center' });
  },

  // Helper function to format dates
  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
};

module.exports = certificateGenerator;