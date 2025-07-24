import React from 'react';
import { Page, Text, View, Document, StyleSheet, Link } from '@react-pdf/renderer';

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  fullName: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    fontSize: 10,
  },
  contactLink: {
    textDecoration: 'none',
    color: 'black',
    marginHorizontal: 5,
  },
  section: {
    marginBottom: 15,
  },
 h2: {
  fontSize: 16,
  fontFamily: 'Helvetica-Bold',
  marginBottom: 8,
  borderBottomWidth: 1, // Define width
  borderBottomColor: '#eeeeee', // Define color
  borderBottomStyle: 'solid', // Define style
  paddingBottom: 3,
},
  h3: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  },
  entry: {
    marginBottom: 10,
  },
  dateRange: {
    fontSize: 10,
    color: '#555555',
  },
  description: {
    marginTop: 4,
  },
});

// Create the Document Component
export const ResumeDocument = ({ resumeData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Contact Info Section */}
      <View style={styles.header}>
        {resumeData.contactInfo?.fullName && (
          <Text style={styles.fullName}>{resumeData.contactInfo.fullName}</Text>
        )}
        <View style={styles.contactInfo}>
          {resumeData.contactInfo?.email && <Text style={styles.contactLink}>{resumeData.contactInfo.email}</Text>}
          {resumeData.contactInfo?.mobile && <Text style={styles.contactLink}>| {resumeData.contactInfo.mobile}</Text>}
          {resumeData.contactInfo?.linkedin && <Link style={styles.contactLink} src={resumeData.contactInfo.linkedin}>| LinkedIn</Link>}
          {resumeData.contactInfo?.github && <Link style={styles.contactLink} src={resumeData.contactInfo.github}>| Github</Link>}
        </View>
      </View>

      {/* Professional Summary */}
      {resumeData.summary ? (
        <View style={styles.section}>
          <Text style={styles.h2}>Professional Summary</Text>
          <Text style={styles.description}>{resumeData.summary}</Text>
        </View>
      ) : null}

      {/* Skills */}
      {resumeData.skills ? (
        <View style={styles.section}>
          <Text style={styles.h2}>Skills</Text>
          <Text>{resumeData.skills}</Text>
        </View>
      ) : null}

      {/* Experience */}
      {Array.isArray(resumeData.experience) && resumeData.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.h2}>Experience</Text>
          {resumeData.experience.map((entry, index) => (
            <View key={index} style={styles.entry}>
              <Text style={styles.h3}>{entry.title} @ {entry.organization}</Text>
              <Text style={styles.dateRange}>
                {entry.startDate} - {entry.current ? 'Present' : entry.endDate}
              </Text>
              <Text style={styles.description}>{entry.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {Array.isArray(resumeData.education) && resumeData.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.h2}>Education</Text>
          {resumeData.education.map((entry, index) => (
            <View key={index} style={styles.entry}>
              <Text style={styles.h3}>{entry.title} @ {entry.organization}</Text>
              <Text style={styles.dateRange}>
                {entry.startDate} - {entry.current ? 'Present' : entry.endDate}
              </Text>
              <Text style={styles.description}>{entry.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Projects (if you have it) */}
      {Array.isArray(resumeData.projects) && resumeData.projects.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.h2}>Projects</Text>
          {resumeData.projects.map((entry, index) => (
            <View key={index} style={styles.entry}>
              <Text style={styles.h3}>{entry.title} @ {entry.organization}</Text>
              <Text style={styles.dateRange}>
                {entry.startDate} - {entry.current ? 'Present' : entry.endDate}
              </Text>
              <Text style={styles.description}>{entry.description}</Text>
            </View>
          ))}
        </View>
      )}
      
    </Page>
  </Document>
);