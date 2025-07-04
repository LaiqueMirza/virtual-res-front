# Resume Analytics Application

A React application for managing and analyzing resumes. This application provides a user interface for uploading, viewing, and analyzing resume data.

## Features

- View a list of uploaded resumes
- Upload new resumes (PDF, DOC, DOCX formats)
- Preview, share, and analyze individual resumes
- Search functionality (placeholder for future implementation)
- Responsive design with Material-UI components

## Technologies Used

- React.js
- Material-UI (MUI) for UI components
- CSS for custom styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Running the Application

To start the development server:

```bash
npm start
```

The application will be available at [http://localhost:3000](http://localhost:3000).

If port 3000 is already in use, you can specify a different port:

```bash
export PORT=3001 && npm start
```

### Building for Production

To create a production build:

```bash
npm run build
```

## Usage

### Uploading Resumes

1. Click the "Upload New Resume" button in the header
2. A popup will appear allowing you to upload a resume file
3. Enter a name for the resume in the "Resume Name" field
4. You can either click to browse files or drag and drop a file into the upload area
5. Only PDF, DOC, and DOCX files are accepted
6. Both the resume name and file are required to enable the upload button
7. Click the "Upload" button to submit the file and resume name to the backend API

## API Integration

The application integrates with a backend API for resume upload:

- **Upload Endpoint**: `http://localhost:8000/v1/resume/upload`
- **Method**: POST
- **Payload**: FormData with the resume file and resume name
  - `file`: The resume document (PDF, DOC, or DOCX)
  - `resumeName`: The name of the resume

## Project Structure

- `src/components/` - React components
  - `Dashboard.js` - Main layout component
  - `Header.js` - Top navigation and search
  - `Sidebar.js` - Side navigation menu
  - `ResumeList.js` - List of resume cards
  - `ResumeCard.js` - Individual resume card component
  - `UploadResumePopup.js` - Popup dialog for resume upload

## Future Enhancements

- Backend integration for storing and retrieving resume data
- Authentication and user management
- Advanced resume analysis features
- Filtering and sorting options
- Detailed analytics dashboard
