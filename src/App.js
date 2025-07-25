import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
	CssBaseline,
	ThemeProvider,
	createTheme,
	responsiveFontSizes,
} from "@mui/material";
import Dashboard from "./components/Dashboard";
import ResumeView from "./components/ResumeView";
import ResumeInternalView from "./components/ResumeInternalView";
import ResumeAnalytics from "./components/ResumeAnalytics";
import Login from "./components/Login";
import NotFound from "./components/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import "./App.css";

// Create a custom theme with responsive settings
let theme = createTheme({
	palette: {
		primary: {
			main: "#673ab7", // Purple color to match the sidebar
		},
		success: {
			main: "#4caf50", // Green color for the upload button
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					textTransform: "none",
				},
			},
		},
	},
	breakpoints: {
		values: {
			xs: 0,
			sm: 600,
			md: 960,
			lg: 1280,
			xl: 1920,
		},
	},
});

// Apply responsive font sizes
theme = responsiveFontSizes(theme);

function App() {
	return (
		<Router>
			<ThemeProvider theme={theme}>
				<CssBaseline /> {/* Normalize CSS */}
				<AuthProvider>
					<Routes>
						{/* Public route */}
						<Route path="/login" element={<Login />} />
						<Route path="/view/:id" element={<ResumeView />} />
						{/* Protected routes */}
						<Route
							path="/"
							element={
								<ProtectedRoute>
									<Dashboard />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/view"
							element={
								<ProtectedRoute>
									<ResumeView />
								</ProtectedRoute>
							}
						/>

						<Route
							path="/preview/:id"
							element={
								<ProtectedRoute>
									<ResumeInternalView />
								</ProtectedRoute>
							}
						/>
						<Route
							path="/resume-analytics/:id"
							element={
								<ProtectedRoute>
									<ResumeAnalytics />
								</ProtectedRoute>
							}
						/>

						{/* 404 Page - Catch all unmatched routes */}
						<Route path="*" element={<NotFound />} />
					</Routes>
				</AuthProvider>
			</ThemeProvider>
		</Router>
	);
}

export default App;
