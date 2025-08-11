import React, { useEffect, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom"; // Added useLocation to detect route changes
import { Box, Typography, CircularProgress, Paper, useTheme, useMediaQuery } from "@mui/material";
import axios from "../utils/axiosConfig";

// Resume view component that renders a resume using Material-UI components

const ResumeView = () => {
	const { id: encodedId } = useParams(); // Get the base64 encoded ID from URL params
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
	const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
	
	// Decode the base64 encoded ID
	const resume_share_links_id = React.useMemo(() => {
		try {
			return atob(encodedId);
		} catch (error) {
			console.error("Error decoding ID:", error);
			return encodedId; // Fallback to encoded ID if decoding fails
		}
	}, [encodedId]);
	
	// Replace Redux with sessionStorage for resumeViewsId
	const [resumeViewsId, setResumeViewsIdState] = useState(() => {
		return sessionStorage.getItem('resumeViewsId');
	});
	
	// Helper function to update resumeViewsId in both state and sessionStorage
	const setResumeViewsId = (id) => {
		setResumeViewsIdState(id);
		if (id) {
			sessionStorage.setItem('resumeViewsId', id);
		} else {
			sessionStorage.removeItem('resumeViewsId');
		}
	};
	
	const [resume, setResume] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [parsedResume, setParsedResume] = useState(null);
	const [unmountLoading, setUnmountLoading] = useState(false);

	// Refs for tracking elements
	const resumeContainerRef = useRef(null);
	const sectionRefs = useRef({});
	const observersRef = useRef({});
	// Engagement tracking states - simplified to only track the four specific thresholds
	const [thresholdsReached, setThresholdsReached] = useState({
		25: false,
		50: false,
		75: false,
		100: false,
	});

	// We're using IntersectionObserver instead of state for section visibility
	// const [sectionVisibility, setSectionVisibility] = useState({});
	const [clickInteractions, setClickInteractions] = useState([]);

	// Store section entry/exit timestamps
	const [sectionEngagement, setSectionEngagement] = useState({});

	// Initialize section engagement when parsedResume changes
	useEffect(() => {
		if (parsedResume) {
			// Initialize section engagement with default values
			const initialSectionEngagement = {};
			// Add all standard sections
			[
				"header",
				"career-summary",
				"skills",
				"achievements",
				"employment-history",
				"projects",
				"education",
			].forEach((section) => {
				initialSectionEngagement[section] = {
					entryTime: null,
					exitTime: null,
					duration: 0,
				};
			});
			setSectionEngagement(initialSectionEngagement);
			console.log("Initialized section engagement:", initialSectionEngagement);
		}
	}, [parsedResume]);

	// Tracking session start time
	const sessionStartTime = useRef(new Date());

	// Function to send engagement data to analytics backend
	// Wrapped in useCallback to prevent recreation on every render
	const sendEngagementData = React.useCallback(
		(eventType, eventData) => {
			// This is a placeholder function that would send data to your analytics backend
			// For now, we'll just log it to the console
			console.log("event type", eventType, " : ", eventData);
			// In a real implementation, you would send this data to your backend
			// Example:
			// Use resumeViewsId from sessionStorage
			// fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/resume/engagement`, {
			//   method: 'POST',
			//   headers: { 'Content-Type': 'application/json' },
			//   body: JSON.stringify({
			//     resume_share_links_id: resume_share_links_id,
			//     resume_views_id: resumeViewsId,
			//     event_type: eventType,
			//     event_data: eventData,
			//     timestamp: Date.now()
			//   })
			// });
			// eslint-disable-next-line react-hooks/exhaustive-deps
		},
		[resume_share_links_id]
	); // Removed dispatch dependency

	// Function to set up IntersectionObserver for section visibility tracking
	// Wrapped in useCallback to prevent recreation on every render
	const setupSectionObservers = React.useCallback(() => {
		// Clean up any existing observers
		Object.entries(observersRef.current).forEach(([key, value]) => {
			// Only call disconnect on actual IntersectionObserver objects, not on visibility flags
			if (
				value &&
				typeof value === "object" &&
				typeof value.disconnect === "function"
			) {
				value.disconnect();
			}
		});

		// Reset observers ref
		observersRef.current = {};

		// Store the current sectionEngagement in a ref to avoid dependency issues
		const currentSectionEngagement = { ...sectionEngagement };

		// Create new observers for each section
		Object.entries(sectionRefs.current).forEach(([sectionId, sectionRef]) => {
			if (!sectionRef) return;

			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						const isVisible = entry.isIntersecting;
						const timestamp = Date.now();

						// Track visibility changes directly without using sectionVisibility state
						// We'll use a local variable to track previous visibility state
						const prevVisibilityRef =
							observersRef.current[`${sectionId}_visible`] || false;

						// Only log visibility changes when they actually occur
						if (prevVisibilityRef !== isVisible) {
							console.log(
								`Section ${sectionId} visibility changed: ${prevVisibilityRef} -> ${isVisible}`
							);
						}

						// If visibility changed, update engagement metrics
						if (prevVisibilityRef !== isVisible) {
							// Store current visibility state for future reference
							observersRef.current[`${sectionId}_visible`] = isVisible;

							// If section became visible, record entry time
							if (isVisible) {
								// Get the current state to avoid stale closures
								const updatedEngagement = {
									...currentSectionEngagement[sectionId],
									entryTime: timestamp,
									exitTime: null,
								};

								// Update our local reference
								currentSectionEngagement[sectionId] = updatedEngagement;

								// Update the state in a way that won't cause infinite loops
								// We're batching this update to avoid multiple rerenders
								setSectionEngagement((prev) => {
									const newState = { ...prev };
									newState[sectionId] = updatedEngagement;
									return newState;
								});

								// Log and send analytics for section entry
								sendEngagementData("section_enter", {
									section_id: sectionId,
									timestamp: timestamp,
									resume_share_links_id: resume_share_links_id,
									resume_views_id: resumeViewsId,
								});
							}
							// If section is no longer visible and had an entry time, record exit time and duration
							else if (!isVisible) {
								// Get the current state from our local reference
								const sectionData = currentSectionEngagement[sectionId];

								// Only process exit if we have an entry time and haven't already recorded an exit time
								if (sectionData?.entryTime && sectionData?.exitTime === null) {
									console.log(`Section exit detected for ${sectionId}`);
									const entryTime = sectionData.entryTime;
									const duration = timestamp - entryTime;
									const durationInSeconds = Math.round(duration / 1000); // Convert milliseconds to seconds
									const viewEndTime = new Date(timestamp); // Create a Date object for the exit time
									console.log(
										`Section ${sectionId} was visible for ${durationInSeconds} seconds`
									);

									// Update our local reference
									const updatedEngagement = {
										...sectionData,
										exitTime: timestamp,
										duration: (sectionData.duration || 0) + duration,
									};

									currentSectionEngagement[sectionId] = updatedEngagement;

									// Update the state in a batched way
									setSectionEngagement((prev) => {
										const newState = { ...prev };
										newState[sectionId] = updatedEngagement;
										return newState;
									});

									// Send analytics data
									sendEngagementData("section_exit", {
										section_id: sectionId,
										duration: duration,
										timestamp: timestamp,
										resume_share_links_id: resume_share_links_id,
										resume_views_id: resumeViewsId,
									});

									console.log("Sending section_exit API call with data:", {
										resume_views_id: resumeViewsId,
										resume_share_links_id: resume_share_links_id,
										section_name: sectionId,
										total_time_spent: durationInSeconds,
										view_end_time: viewEndTime.toISOString(),
									});

									// Make API call to track section exit event only if we have resumeViewsId
									if (resumeViewsId) {
										axios
											.post("/v1/resume/track-event", {
												resume_views_id: resumeViewsId,
												resume_share_links_id: resume_share_links_id,
												section_name: sectionId,
												total_time_spent: durationInSeconds,
												view_end_time: viewEndTime.toISOString(),
											})
											.then((response) => {
												console.log(
													`Successfully tracked exit for section: ${sectionId}`,
													response.data
												);
											})
											.catch((error) => {
												console.error(
													"Error tracking section exit event:",
													error
												);
											});
									} else {
										console.warn(
											`Cannot track section exit for ${sectionId}: resumeViewsId is not available yet`
										);
									}
								}
							}
						}
					});
				},
				{
					threshold: 0.1, // Trigger when at least 10% of the target is visible
					rootMargin: "-10px", // Small negative margin to ensure the section is actually in view
				} // Simplified threshold for more reliable detection
			);

			// Start observing the section
			observer.observe(sectionRef);

			// Store the observer reference
			observersRef.current[sectionId] = observer;
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resume_share_links_id, sendEngagementData, resumeViewsId]); // Removed sectionEngagement from dependencies to prevent infinite rerenders

	// Function to get user's IP address using ipify API
	const getUserIP = async () => {
		try {
			// Set a timeout for the fetch request
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

			const response = await fetch("https://api.ipify.org?format=json", {
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();
			return data.ip;
		} catch (error) {
			console.error("Error fetching IP:", error);
			// Try alternative IP API if first one fails
			try {
				const response = await fetch("https://api.db-ip.com/v2/free/self");
				if (response.ok) {
					const data = await response.json();
					return data.ipAddress;
				}
			} catch (fallbackError) {
				console.error("Fallback IP service also failed:", fallbackError);
			}
			return "0.0.0.0"; // Final fallback IP
		}
	};

	// Function to get browser and device information
	const getBrowserInfo = () => {
		try {
			const userAgent = navigator.userAgent || "Unknown";
			let browserName = "Unknown";
			let deviceType = "Unknown";

			// Detect browser
			if (userAgent.match(/chrome|chromium|crios/i)) {
				browserName = "Chrome";
			} else if (userAgent.match(/firefox|fxios/i)) {
				browserName = "Firefox";
			} else if (userAgent.match(/safari/i)) {
				browserName = "Safari";
			} else if (userAgent.match(/opr\//i)) {
				browserName = "Opera";
			} else if (userAgent.match(/edg/i)) {
				browserName = "Edge";
			} else if (userAgent.match(/msie|trident/i)) {
				browserName = "Internet Explorer";
			}

			// Detect device type
			if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
				deviceType = "Tablet";
			} else if (
				/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
					userAgent
				)
			) {
				deviceType = "Mobile";
			} else {
				deviceType = "Desktop";
			}

			return { browserName, deviceType, userAgent };
		} catch (error) {
			console.error("Error getting browser info:", error);
			return {
				browserName: "Unknown",
				deviceType: "Unknown",
				userAgent: "Unknown",
			};
		}
	};

	// Function to get user's location
	const getUserLocation = async (ip) => {
		try {
			// Set a timeout for the fetch request
			const controller = new AbortController();
			const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

			const response = await fetch(`https://ipapi.co/${ip}/json/`, {
				signal: controller.signal,
			});
			clearTimeout(timeoutId);

			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}

			const data = await response.json();

			// Check if the API returned an error
			if (data.error) {
				throw new Error(data.reason || "API returned an error");
			}

			return {
				city: data.city || "Unknown",
				country: data.country_name || "Unknown",
			};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		} catch (error) {
			console.error("Error fetching location:", error);
			// Try alternative location API if first one fails
			try {
				const response = await fetch(`https://ipinfo.io/${ip}/json`);
				if (response.ok) {
					const data = await response.json();
					return {
						city: data.city || "Unknown",
						country: data.country || "Unknown",
					};
				}
			} catch (fallbackError) {
				console.error("Fallback location service also failed:", fallbackError);
			}
			return { city: "Unknown", country: "Unknown" };
		}
	};

	// Effect to fetch the resume data when the ID changes
	// Note: This useEffect will run twice in development mode because of React.StrictMode
	// This is expected behavior and helps catch bugs, but won't happen in production
	useEffect(() => {
		if (!resume_share_links_id) {
			setError("Invalid link. Please check the URL.");
			setLoading(false);
			return;
		}

		const fetchResume = async () => {
			try {
				// console.log('Fetching resume with ID:', resume_share_links_id);

				// Create a promise that will resolve with user information or reject after timeout
				// This function is defined inside the useEffect to avoid recreating it on every render
				// but could be moved outside and memoized with useCallback if needed elsewhere
				const getUserInfoWithTimeout = async (timeoutMs = 5000) => {
					return Promise.race([
						// The actual user info gathering
						(async () => {
							try {
								const userIP = await getUserIP();
								const { browserName, deviceType, userAgent } = getBrowserInfo();
								const { city, country } = await getUserLocation(userIP);

								// console.log('User info gathered successfully:', {
								// userIP, browserName, deviceType, city, country
								// });

								return {
									userIP,
									browserName,
									deviceType,
									userAgent,
									city,
									country,
									infoComplete: true,
								};
							} catch (error) {
								console.error("Error gathering complete user info:", error);
								// Return partial info if available
								const { browserName, deviceType, userAgent } = getBrowserInfo();
								return {
									userIP: "0.0.0.0",
									browserName,
									deviceType,
									userAgent,
									city: "Unknown",
									country: "Unknown",
									infoComplete: false,
								};
							}
						})(),

						// Timeout promise
						new Promise((resolve) => {
							setTimeout(() => {
								// console.log('User info gathering timed out, using fallback values');
								const { browserName, deviceType, userAgent } = getBrowserInfo();
								// Return partial info after timeout
								resolve({
									userIP: "0.0.0.0",
									browserName,
									deviceType,
									userAgent,
									city: "Unknown",
									country: "Unknown",
									infoComplete: false,
								});
							}, timeoutMs);
						}),
					]);
				};

				// Get user info with a 5-second timeout
				const userInfo = await getUserInfoWithTimeout(5000);

				// Prepare the request payload
				const payload = {
					resume_share_links_id: String(resume_share_links_id), // Ensure ID is sent as a string
					viewer_ip: userInfo.userIP,
					device_type: userInfo.deviceType,
					browser_info: `${userInfo.browserName} (${userInfo.userAgent})`,
					location_city: userInfo.city,
					location_country: userInfo.country,
				};

				// Include resumeViewsId in the payload if it's already available from Redux
				if (resumeViewsId) {
					payload.resume_views_id = resumeViewsId;
				}

				// console.log('Sending API request with payload:', payload);

				// Make the API call with whatever info we have
				const response = await axios.post("/v1/resume/preview", payload, {
					timeout: 10000, // 10 second timeout
				});
				// console.log('API response status:', response.status);

				const responseData = response.data;
				// console.log('API response data:', responseData);

				const { data } = responseData;
				setResume(data);
				setLoading(false);

				// Store resume_views_id in sessionStorage for persistence
				if (data && data.resume_views_id) {
					setResumeViewsId(data.resume_views_id);
				}
				// eslint-disable-next-line react-hooks/exhaustive-deps

				// We'll render the template in a useEffect that watches for resume changes
				if (!data || !data.resume_json) {
					console.error("Resume JSON data not available in the response");
				}
			} catch (err) {
				setError(
					err.message || "Failed to load resume. Please try again later."
				);
				setLoading(false);
			}
		};

		fetchResume();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [resume_share_links_id]); // Removed dispatch from dependencies to prevent double API calls

	// Utility functions for tracking user engagement

	// Track scroll depth - simplified to only track specific thresholds
	// Wrapped in useCallback to prevent recreation on every render
	const trackScrollDepth = React.useCallback(() => {
		if (!resumeContainerRef.current) return;

		const container = document.documentElement || document.body;
		const containerHeight = container.scrollHeight - window.innerHeight;
		const scrollPosition = window.scrollY || window.pageYOffset;

		// Calculate scroll percentage - use a small buffer (0.98) to ensure 100% is reached more easily
		const scrollPercentage =
			containerHeight > 0
				? Math.min(
						Math.ceil((scrollPosition / (containerHeight * 0.94)) * 100),
						100
				  )
				: 0;

		// Check if we've passed any thresholds that haven't been reached yet
		const thresholds = [25, 50, 75, 100];
		thresholds.forEach((threshold) => {
			// Only trigger when crossing a threshold for the first time
			if (scrollPercentage >= threshold && !thresholdsReached[threshold]) {
				// Mark this threshold as reached
				setThresholdsReached((prev) => ({
					...prev,
					[threshold]: true,
				}));

				// Send to analytics backend
				// Use resumeViewsId from sessionStorage

				sendEngagementData("scroll_depth", {
					threshold,
					timestamp: Date.now(),
					resume_share_links_id: resume_share_links_id,
					resume_views_id: resumeViewsId,
					scroll_percentage: threshold,
					actual_percentage: scrollPercentage, // Include actual percentage for debugging
				});

				// Call the backend API for scroll depth tracking - only once per threshold
				// Using the same resumeViewsId from above

				axios
					.post("/v1/resume/update-scroll", {
						resume_views_id: resumeViewsId,
						scroll_percentage: threshold,
					})
					.catch((error) => {
						console.error("Error updating scroll depth:", error);
					});
			}
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		resumeViewsId,
		resume_share_links_id,
		sendEngagementData,
		thresholdsReached,
	]); // Only depend on resume_share_links_id, sendEngagementData, and thresholdsReached

	// Track section visibility is now handled by IntersectionObserver in setupSectionObservers
	// This function is kept as a comment for reference
	/*
  const trackSectionVisibility = () => {
    if (!resumeContainerRef.current) return;
    
    const viewportTop = window.scrollY || window.pageYOffset;
    const viewportBottom = viewportTop + window.innerHeight;
    
    // Check each section's visibility
    Object.entries(sectionRefs.current).forEach(([sectionId, sectionRef]) => {
      if (!sectionRef) return;
      
      const sectionRect = sectionRef.getBoundingClientRect();
      
      // Section is visible if it's in the viewport
      const isVisible = 
        sectionRect.top < window.innerHeight &&
        sectionRect.bottom > 0;
      
      // Update section visibility state
      setSectionVisibility(prev => {
        // If visibility changed, update engagement metrics
        if (prev[sectionId] !== isVisible) {
          const timestamp = Date.now();
          
          // If section became visible and user has scrolled, record entry time
          if (isVisible) {
            setSectionEngagement(prev => ({
              ...prev,
              [sectionId]: {
                ...prev[sectionId],
                entryTime: timestamp,
                // Reset exit time when re-entering
                exitTime: null
              }
            }));
            
            // Only log and send analytics if user has actually scrolled
            if (scrollDepthData.hasUserScrolled) {
              console.log(`Section entered: ${sectionId}`);
              sendEngagementData('section_enter', {
                section_id: sectionId,
                timestamp: timestamp,
                resume_share_links_id: resume_share_links_id
              });
            }
          } 
          // If section is no longer visible and had an entry time, record exit time and duration
          else if (sectionEngagement[sectionId]?.entryTime) {
            const entryTime = sectionEngagement[sectionId].entryTime;
            const duration = timestamp - entryTime;
            
            setSectionEngagement(prev => ({
              ...prev,
              [sectionId]: {
                ...prev[sectionId],
                exitTime: timestamp,
                duration: (prev[sectionId]?.duration || 0) + duration
              }
            }));
            console.log(`Section exited: ${sectionId}, duration: ${duration}ms`);
            sendEngagementData('section_exit', {
              section_id: sectionId,
              duration: duration,
              timestamp: timestamp,
              resume_share_links_id: resume_share_links_id
            });
          }
        }
        
        return { ...prev, [sectionId]: isVisible };
      });
    });
  };
  */

	// Track click interactions on all elements in the resume
	// Wrapped in useCallback to prevent recreation on every render
	const trackClickInteraction = React.useCallback(
		(event) => {
			// Get the clicked element
			const clickedElement = event.target;
			const timestamp = Date.now();

			// Find which section contains this element
			let sectionId = "unknown";
			Object.entries(sectionRefs.current).forEach(([id, ref]) => {
				if (ref && ref.contains(clickedElement)) {
					sectionId = id;
				}
			});

			// Get link information if the clicked element is a link or has a parent link
			let link = null;
			let elementText = clickedElement.textContent?.trim() || "";

			// Check if the clicked element is a link or has a parent link
			if (clickedElement.tagName.toLowerCase() === "a") {
				link = clickedElement.href;
			} else {
				// Check if any parent element is a link (up to 3 levels up)
				let parentElement = clickedElement.parentElement;
				let level = 0;
				while (parentElement && level < 3) {
					if (parentElement.tagName.toLowerCase() === "a") {
						link = parentElement.href;
						if (!elementText) {
							elementText = parentElement.textContent?.trim() || "";
						}
						break;
					}
					parentElement = parentElement.parentElement;
					level++;
				}
			}

			// Record the click interaction
			const clickData = {
				timestamp,
				sectionId,
				element_text: elementText,
				link: link,
			};

			setClickInteractions((prev) => [...prev, clickData]);

			// Send to analytics backend
			sendEngagementData("click", {
				...clickData,
				resume_share_links_id: resume_share_links_id,
				resume_views_id: resumeViewsId,
			});

			// Call the backend API to track click events
			if (resumeViewsId) {
				axios
					.post("/v1/resume/track-click", {
						resume_views_id: resumeViewsId,
						resume_share_links_id: resume_share_links_id,
						section_name: sectionId,
						link: link,
						element_text: elementText,
					})
					.catch((error) => {
						console.error("Error tracking click event:", error);
					});
			}
		},
		[resume_share_links_id, sectionRefs, sendEngagementData, resumeViewsId]
	);

	// Effect to parse resume data when it changes
	useEffect(() => {
		if (resume && resume.resume_json) {
			try {
				// Parse the JSON string to get the resume data
				let cv;

				// First check if resume_json is already an object
				if (
					typeof resume.resume_json === "object" &&
					resume.resume_json !== null
				) {
					cv = resume.resume_json;
				} else {
					try {
						// First try parsing once (in case it's already a JSON string)
						cv = JSON.parse(resume.resume_json);
						// Check if it's still a string that needs parsing
						if (typeof cv === "string") {
							cv = JSON.parse(cv);
						}
					} catch (parseError) {
						// Removed console.error to reduce console output
						// If double parsing fails, try single parsing
						cv = JSON.parse(resume.resume_json);
					}
				}

				// Removed console.log to reduce console output
				setParsedResume(cv);
			} catch (error) {
				// Keep this console.error for debugging critical parsing errors
				console.error("Error parsing resume JSON:", error);
				setError(`Error parsing resume data: ${error.message}`);
			}
		}
	}, [resume]);

	// Initialize section refs when resume data is loaded
	useEffect(() => {
		if (!parsedResume) return;

		// Define the sections we want to track
		const sectionIds = [
			"header",
			"career-summary",
			"skills",
			"achievements",
			"employment-history",
			"projects",
			"education",
		];

		// Initialize section engagement data
		const initialSectionEngagement = {};
		sectionIds.forEach((id) => {
			initialSectionEngagement[id] = {
				entryTime: null,
				exitTime: null,
				duration: 0,
				visits: 0,
			};
		});

		setSectionEngagement(initialSectionEngagement);
		// We're using IntersectionObserver instead of state for section visibility
		// setSectionVisibility(sectionIds.reduce((acc, id) => ({ ...acc, [id]: false }), {}));

		// Removed console.log to reduce console output
	}, [parsedResume]);

	// Function to track section exits and send data to the backend
	const trackSectionExits = React.useCallback(() => {
		if (!resumeViewsId) return;

		const exitTime = new Date();

		// Process all sections that have entry times but no exit times
		Object.entries(sectionEngagement).forEach(([sectionId, sectionData]) => {
			// Only process sections that have been entered but not exited
			if (sectionData.entryTime && !sectionData.exitTime) {
				const entryTime = sectionData.entryTime;
				const duration = Date.now() - entryTime;
				const durationInSeconds = Math.round(duration / 1000); // Convert to seconds

				console.log(
					`Tracking exit for section ${sectionId} on page unload/unmount`
				);
				console.log(
					`Section ${sectionId} was visible for ${durationInSeconds} seconds`
				);

				const payload = {
					resume_views_id: resumeViewsId,
					resume_share_links_id: resume_share_links_id,
					section_name: sectionId,
					total_time_spent: durationInSeconds,
					view_end_time: exitTime.toISOString(),
				};

				console.log("Sending section exit data:", payload);

				// For tab closing scenarios, use a synchronous approach with fetch + keepalive
				// This is more reliable than sendBeacon for our use case
				try {
					// Use fetch with keepalive flag for page unload scenarios
					fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/resume/track-event`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(payload),
						keepalive: true, // This ensures the request continues even if the page unloads
					})
					.then(response => {
						if (response.ok) {
							console.log(`Section exit data sent successfully via fetch with keepalive for section: ${sectionId}`);
						} else {
							console.error(`Fetch request failed with status: ${response.status} for section: ${sectionId}`);
						}
					})
					.catch(error => {
						console.error(`Error with fetch keepalive for section ${sectionId}:`, error);
						
						// Fallback to sendBeacon if fetch fails
						if (navigator.sendBeacon) {
							try {
								const data = JSON.stringify(payload);
								const url = `${process.env.REACT_APP_API_BASE_URL}/v1/resume/track-event`;
								const success = navigator.sendBeacon(
									url,
									new Blob([data], { type: "application/json" })
								);
								if (success) {
									console.log(`Section exit data sent successfully via sendBeacon (fallback) for section: ${sectionId}`);
								} else {
									console.error(`sendBeacon also failed for section: ${sectionId}`);
								}
							} catch (beaconError) {
								console.error(`sendBeacon fallback failed for section ${sectionId}:`, beaconError);
							}
						}
					});
				} catch (error) {
					console.error(`Error setting up fetch request for section ${sectionId}:`, error);
					
					// Final fallback to axios for non-unload scenarios
					axios
						.post("/v1/resume/track-event", payload, {
							timeout: 2000,
						})
						.then((response) => {
							console.log(`Section exit data sent successfully via axios for section: ${sectionId}`, response.data);
						})
						.catch((axiosError) => {
							console.error(`All methods failed to send section exit data for section ${sectionId}:`, axiosError);
						});
				}
			}
		});
	}, [resumeViewsId, resume_share_links_id, sectionEngagement]);

	// Function to send view time data to the backend
	const sendViewTimeData = React.useCallback(() => {
		if (!resumeViewsId) {
			console.log("Cannot send view time data: resumeViewsId is not available");
			return;
		}

		const sessionEndTime = new Date();
		const totalSessionDuration = Math.round(
			(sessionEndTime - sessionStartTime.current) / 1000
		); // Convert to seconds

		const payload = {
			resume_views_id: resumeViewsId,
			total_time_spent: totalSessionDuration,
			view_end_time: sessionEndTime.toISOString(),
		};

		console.log("Sending view time data:", payload);

		// For tab closing scenarios, use a synchronous approach with fetch + keepalive
		// This is more reliable than sendBeacon for our use case
		try {
			// Use fetch with keepalive flag for page unload scenarios
			fetch(`${process.env.REACT_APP_API_BASE_URL}/v1/resume/update-view-time`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
				keepalive: true, // This ensures the request continues even if the page unloads
			})
			.then(response => {
				if (response.ok) {
					console.log("View time data sent successfully via fetch with keepalive");
				} else {
					console.error("Fetch request failed with status:", response.status);
				}
			})
			.catch(error => {
				console.error("Error with fetch keepalive", error);
				
				// Fallback to sendBeacon if fetch fails
				if (navigator.sendBeacon) {
					try {
						const data = JSON.stringify(payload);
						const url = `${process.env.REACT_APP_API_BASE_URL}/v1/resume/update-view-time`;
						const success = navigator.sendBeacon(
							url,
							new Blob([data], { type: "application/json" })
						);
						if (success) {
							console.log("View time data sent successfully via sendBeacon (fallback)");
						} else {
							console.error("sendBeacon also failed");
						}
					} catch (beaconError) {
						console.error("sendBeacon fallback failed:", beaconError);
					}
				}
			});
		} catch (error) {
			console.error("Error setting up fetch request:", error);
			
			// Final fallback to axios for non-unload scenarios
			axios
				.post("/v1/resume/update-view-time", payload, {
					timeout: 2000,
				})
				.then((response) => {
					console.log("View time data sent successfully via axios:", response.data);
				})
				.catch((axiosError) => {
					console.error("All methods failed to send view time data:", axiosError);
				});
		}
	}, [resumeViewsId, sessionStartTime]);

	// Use location to detect route changes
	const location = useLocation();

	// currently of no use but still for protect need further R & D
	useEffect(() => {
		// Store the current location path to detect actual navigation changes
		const currentPath = location.pathname;

		return () => {
			const newPath = window.location.pathname;
			if (newPath !== currentPath) {
				// Track section exits and send view time data when navigating away
				trackSectionExits();
				sendViewTimeData();
			}
		};
	}, [location, trackSectionExits, sendViewTimeData]);

	// Set up comprehensive event listeners for page unload tracking
	useEffect(() => {
		if (!resumeViewsId) return;

		const handlePageUnload = () => {
			console.log("unload detected, sending view time data");
			// Set loading state to true to show loader
			setUnmountLoading(true);
			
			// Track section exits first
			trackSectionExits();
			// Then send overall view time data
			sendViewTimeData();
			
			// Delay unmounting by 2 seconds to allow API calls to complete
			return new Promise(resolve => setTimeout(resolve, 3000));
		};

		const handleBeforeUnload = (event) => {
			console.log("page: Before unload detected");
			// Show the loading overlay
			setUnmountLoading(true);
			
			// Call the page unload handler
			handlePageUnload();
			
			// Delay the unload by 2 seconds to allow API calls to complete
			const start = Date.now();
			while (Date.now() - start < 3000) {
				// This creates a blocking delay to ensure API calls complete
			}
			
			// Don't prevent default to allow normal navigation
		};

		// const handleVisibilityChange = () => {
		// 	if (document.visibilityState === "hidden") {
		// 		console.log("Page: visibility changed to hidden");
		// 		handlePageUnload();
		// 	}
		// };

		// const handlePageHide = () => {
		// 	console.log("Page: hide detected");
		// 	handlePageUnload();
		// };

		// Add multiple event listeners for comprehensive coverage
		window.addEventListener("beforeunload", handleBeforeUnload);
		// window.addEventListener("pagehide", handlePageHide);
		// document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			window.removeEventListener("beforeunload", handleBeforeUnload);
			// window.removeEventListener("pagehide", handlePageHide);
			// document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [resumeViewsId, sendViewTimeData, trackSectionExits]);

	// Set up event listeners for tracking
	useEffect(() => {
		// Skip if still loading or there's an error
		if (loading || error || !parsedResume || !resumeContainerRef.current)
			return;

		// Throttle function to limit how often the scroll handler fires
		const throttle = (callback, delay) => {
			let lastCall = 0;
			return function (...args) {
				const now = Date.now();
				if (now - lastCall >= delay) {
					lastCall = now;
					callback(...args);
				}
			};
		};

		// Throttled scroll handler - only used for scroll depth tracking now
		const handleScroll = throttle(() => {
			trackScrollDepth();
			// Section visibility is now handled by IntersectionObserver
		}, 200); // 200ms throttle

		// Click handler
		const handleClick = (e) => {
			trackClickInteraction(e);
		};

		// Add event listeners to window
		window.addEventListener("scroll", handleScroll);
		window.addEventListener("click", handleClick);

		// Set up IntersectionObserver for each section
		// This will track sections visible on initial load without requiring scroll
		setupSectionObservers();

		// Store the current value of sessionStartTime for cleanup function
		const currentSessionStartTime = sessionStartTime.current;

		// Clean up event listeners and observers on unmount
		return () => {
			// Show loading overlay
			setUnmountLoading(true);
			
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("click", handleClick);

			// Disconnect all observers
			Object.entries(observersRef.current).forEach(([key, value]) => {
				// Only call disconnect on actual IntersectionObserver objects, not on visibility flags
				if (
					value &&
					typeof value === "object" &&
					typeof value.disconnect === "function"
				) {
					value.disconnect();
				}
			});

			// On unmount, record final engagement metrics
			const sessionEndTime = Date.now();
			const totalSessionDuration = sessionEndTime - currentSessionStartTime;

			// Removed console.logs to reduce console output

			// Send final engagement data to analytics backend
			// Use resumeViewsId from Redux,

			sendEngagementData("session_end", {
				duration: totalSessionDuration,
				section_engagement: sectionEngagement,
				click_interactions: clickInteractions.length,
				thresholds_reached: Object.entries(thresholdsReached)
					.filter(([_, reached]) => reached)
					.map(([threshold]) => parseInt(threshold)),
				resume_share_links_id: resume_share_links_id,
				resume_views_id: resumeViewsId,
			});
			
			// Create a delay to allow API calls to complete
			const start = Date.now();
			while (Date.now() - start < 3000) {
				// This creates a blocking delay to ensure API calls complete
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		loading,
		error,
		parsedResume,
		resume_share_links_id,
		trackScrollDepth,
		trackClickInteraction,
		setupSectionObservers,
		sendEngagementData,
	]);
	// Removed unnecessary dependencies that were causing re-renders
	// Original: [loading, error, parsedResume, scrollDepthData.thresholds, scrollDepthData.hasUserScrolled, sectionEngagement, trackScrollDepth, trackClickInteraction, setupSectionObservers, sendEngagementData, clickInteractions, resume_share_links_id, scrollDepthData.maxScrollDepth]

	// Set up or update section observers when sectionRefs change
	useEffect(() => {
		// Only set up observers when we have the necessary data and refs
		if (
			!loading &&
			!error &&
			parsedResume &&
			Object.keys(sectionRefs.current).length > 0
		) {
			// Small delay to ensure DOM is fully rendered
			const timerId = setTimeout(() => {
				// Call the function directly from the ref to avoid dependency issues
				// This prevents the circular dependency that causes infinite rerenders
				setupSectionObservers();
				console.log("Section observers set up after delay");
			}, 500);

			// Clean up the timer if the component unmounts before the timeout completes
			return () => {
				clearTimeout(timerId);
				// Clean up observers
				Object.entries(observersRef.current).forEach(([key, value]) => {
					// Only call disconnect on actual IntersectionObserver objects, not on visibility flags
					if (
						value &&
						typeof value === "object" &&
						typeof value.disconnect === "function"
					) {
						value.disconnect();
					}
				});
			};
		}

		// If we don't have the necessary data, just provide a cleanup function
		return () => {
			// Clean up observers when component unmounts or dependencies change
			Object.entries(observersRef.current).forEach(([key, value]) => {
				// Only call disconnect on actual IntersectionObserver objects, not on visibility flags
				if (
					value &&
					typeof value === "object" &&
					typeof value.disconnect === "function"
				) {
					value.disconnect();
				}
			});
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loading, error, parsedResume]); // Keep minimal dependencies to prevent rerenders

	if (loading) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}>
				<CircularProgress />
			</Box>
		);
	}

	if (error || !resume_share_links_id) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}>
				<Typography variant="h6" color="error">
					{error || "Invalid link. Please check the URL."}
				</Typography>
			</Box>
		);
	}

	// If no parsed resume data is available yet but we're not loading or in error state
	if (!loading && !error && !parsedResume) {
		return (
			<Box
				sx={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100vh",
				}}>
				<Typography>Waiting for resume data...</Typography>
			</Box>
		);
	}

	return (
		<Box 
			ref={resumeContainerRef} 
			sx={{ 
				maxHeight: "100vh", 
				p: { xs: 1, sm: 2, md: 3 },
				width: '100%',
				position: 'relative'
			}}
		>
			{/* Unmount Loading Overlay */}
			{unmountLoading && (
				<Box
					sx={{
						position: 'fixed',
						top: 0,
						left: 0,
						right: 0,
						bottom: 0,
						backgroundColor: 'rgba(255, 255, 255, 0.8)',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 9999
					}}
				>
					<CircularProgress size={60} />
					<Typography variant="h6" sx={{ mt: 2 }}>
						Loading...
					</Typography>
				</Box>
			)}
			{parsedResume && (
				<Paper
					elevation={1}
					sx={{
						maxWidth: { xs: "100%", sm: "90%", md: "780px" },
						margin: "0 auto",
						padding: { xs: "1rem", sm: "1.5rem", md: "2rem" },
						backgroundColor: "#fff",
						overflowY: "auto",
						borderRadius: { xs: 0, sm: 1, md: 2 },
						width: '100%'
					}}>
					{/* Header */}
					<Box id="header" ref={(el) => (sectionRefs.current["header"] = el)}>
						<Typography 
							variant={isMobile ? "h5" : "h4"} 
							sx={{ 
								fontWeight: 700, 
								mb: { xs: 0.3, sm: 0.5 },
								fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
								wordBreak: 'break-word'
							}}
						>
							{parsedResume.basics.name}
						</Typography>

						<Typography 
							variant="body1" 
							sx={{ 
								fontStyle: "italic", 
								mb: { xs: 0.3, sm: 0.5 },
								fontSize: { xs: '0.9rem', sm: '1rem' }
							}}
						>
							{parsedResume.basics.headline}
						</Typography>

						<Typography 
							variant="body1" 
							sx={{ 
								fontStyle: "italic", 
								mb: { xs: 1.5, sm: 2 },
								fontSize: { xs: '0.85rem', sm: '1rem' },
								lineHeight: 1.4
							}}
						>
							{parsedResume.basics.address}
							<br />
							{parsedResume.basics.phone} •{" "}
							<a 
								href={`mailto:${parsedResume.basics.email}`}
								style={{ wordBreak: 'break-all' }}
							>
								{parsedResume.basics.email}
							</a>
						</Typography>
					</Box>

					{/* Career Summary */}
					<Box
						id="career-summary"
						ref={(el) => (sectionRefs.current["career-summary"] = el)}>
						<Typography
							variant={isMobile ? "h6" : "h5"}
							sx={{
								fontWeight: 700,
								mt: { xs: 2, sm: 3 },
								mb: { xs: 0.75, sm: 1 },
								borderBottom: "1px solid #ccc",
								pb: { xs: 0.3, sm: 0.5 },
								fontSize: { xs: '1.1rem', sm: '1.5rem' }
							}}>
							Career Summary
						</Typography>
						<Typography 
							variant="body1" 
							paragraph
							sx={{
								fontSize: { xs: '0.9rem', sm: '1rem' },
								lineHeight: { xs: 1.4, sm: 1.5 }
							}}
						>
							{parsedResume.careerSummary}
						</Typography>
					</Box>

					{/* Skills */}
					<Box id="skills" ref={(el) => (sectionRefs.current["skills"] = el)}>
						<Typography
							variant={isMobile ? "h6" : "h5"}
							sx={{
								fontWeight: 700,
								mt: { xs: 2, sm: 3 },
								mb: { xs: 0.75, sm: 1 },
								borderBottom: "1px solid #ccc",
								pb: { xs: 0.3, sm: 0.5 },
								fontSize: { xs: '1.1rem', sm: '1.5rem' }
							}}>
							Key Skills
						</Typography>
						<Box sx={{ 
							display: "flex", 
							flexWrap: "wrap", 
							gap: { xs: 0.3, sm: 0.5 }, 
							mb: { xs: 1.5, sm: 2 }
						}}>
							{parsedResume.skills.map((skill, index) => (
								<Box
									key={index}
									sx={{
										backgroundColor: "#e7f1ff",
										padding: { xs: "0.1rem 0.4rem", sm: "0.15rem 0.5rem" },
										borderRadius: { xs: "0.25rem", sm: "0.3rem" },
										fontSize: { xs: "0.7rem", sm: "0.8rem" },
										lineHeight: 1.2
									}}>
									{skill}
								</Box>
							))}
						</Box>
					</Box>

					{/* Achievements */}
					<Box
						id="achievements"
						ref={(el) => (sectionRefs.current["achievements"] = el)}>
						<Typography
							variant={isMobile ? "h6" : "h5"}
							sx={{
								fontWeight: 700,
								mt: { xs: 2, sm: 3 },
								mb: { xs: 0.75, sm: 1 },
								borderBottom: "1px solid #ccc",
								pb: { xs: 0.3, sm: 0.5 },
								fontSize: { xs: '1.1rem', sm: '1.5rem' }
							}}>
							Achievements
						</Typography>
						<Box component="ul" sx={{ ml: { xs: 2, sm: 3 }, mb: { xs: 1.5, sm: 2 } }}>
							{parsedResume.achievements.map((achievement, index) => (
								<Box component="li" key={index} sx={{ mb: { xs: 0.3, sm: 0.5 } }}>
									<Typography 
										variant="body1"
										sx={{
											fontSize: { xs: '0.9rem', sm: '1rem' },
											lineHeight: { xs: 1.4, sm: 1.5 }
										}}
									>
										{achievement}
									</Typography>
								</Box>
							))}
						</Box>
					</Box>

					{/* Employment History */}
					<Box
						id="employment-history"
						ref={(el) => (sectionRefs.current["employment-history"] = el)}>
						<Typography
							variant={isMobile ? "h6" : "h5"}
							sx={{
								fontWeight: 700,
								mt: { xs: 2, sm: 3 },
								mb: { xs: 0.75, sm: 1 },
								borderBottom: "1px solid #ccc",
								pb: { xs: 0.3, sm: 0.5 },
								fontSize: { xs: '1.1rem', sm: '1.5rem' }
							}}>
							Employment History
						</Typography>
						{parsedResume.employmentHistory.map((job, jobIndex) => (
							<Box key={jobIndex} sx={{ mb: { xs: 1.5, sm: 2 } }}>
								<Typography 
									variant={isMobile ? "subtitle1" : "h6"} 
									sx={{ 
										fontWeight: 700, 
										mb: { xs: 0.3, sm: 0.5 },
										fontSize: { xs: '1rem', sm: '1.25rem' },
										wordBreak: 'break-word'
									}}
								>
									{job.title} – {job.company}
								</Typography>
								<Typography 
									variant="body2" 
									sx={{ 
										fontStyle: "italic", 
										mb: { xs: 0.75, sm: 1 },
										fontSize: { xs: '0.8rem', sm: '0.875rem' }
									}}
								>
									{job.start} – {job.end} | {job.location}
								</Typography>
								<Box component="ul" sx={{ ml: { xs: 2, sm: 3 } }}>
									{job.bullets.map((bullet, bulletIndex) => (
										<Box component="li" key={bulletIndex} sx={{ mb: { xs: 0.3, sm: 0.5 } }}>
											<Typography 
												variant="body1"
												sx={{
													fontSize: { xs: '0.9rem', sm: '1rem' },
													lineHeight: { xs: 1.4, sm: 1.5 }
												}}
											>
												{bullet}
											</Typography>
										</Box>
									))}
								</Box>
							</Box>
						))}
					</Box>

					{/* Projects */}
					<Box
						id="projects"
						ref={(el) => (sectionRefs.current["projects"] = el)}>
						<Typography
							variant={isMobile ? "h6" : "h5"}
							sx={{
								fontWeight: 700,
								mt: { xs: 2, sm: 3 },
								mb: { xs: 0.75, sm: 1 },
								borderBottom: "1px solid #ccc",
								pb: { xs: 0.3, sm: 0.5 },
								fontSize: { xs: '1.1rem', sm: '1.5rem' }
							}}>
							Selected Projects
						</Typography>
						{parsedResume.projects.map((project, projectIndex) => (
							<Box key={projectIndex} sx={{ mb: { xs: 1.5, sm: 2 } }}>
								<Typography 
									variant={isMobile ? "subtitle1" : "h6"} 
									sx={{ 
										fontWeight: 700, 
										mb: { xs: 0.3, sm: 0.5 },
										fontSize: { xs: '1rem', sm: '1.25rem' },
										wordBreak: 'break-word'
									}}
								>
									{project.name}
								</Typography>
								<Typography 
									variant="body2" 
									sx={{ 
										fontStyle: "italic", 
										mb: { xs: 0.75, sm: 1 },
										fontSize: { xs: '0.8rem', sm: '0.875rem' },
										wordBreak: 'break-word'
									}}
								>
									{project.period} • {project.tech.join(", ")}
								</Typography>
								<Typography 
									variant="body1" 
									paragraph
									sx={{
										fontSize: { xs: '0.9rem', sm: '1rem' },
										lineHeight: { xs: 1.4, sm: 1.5 }
									}}
								>
									{project.description}
								</Typography>
							</Box>
						))}
					</Box>

					{/* Education */}
					<Box
						id="education"
						ref={(el) => (sectionRefs.current["education"] = el)}>
						<Typography
							variant={isMobile ? "h6" : "h5"}
							sx={{
								fontWeight: 700,
								mt: { xs: 2, sm: 3 },
								mb: { xs: 0.75, sm: 1 },
								borderBottom: "1px solid #ccc",
								pb: { xs: 0.3, sm: 0.5 },
								fontSize: { xs: '1.1rem', sm: '1.5rem' }
							}}>
							Education
						</Typography>
						{parsedResume.education.map((edu, eduIndex) => (
							<Box key={eduIndex} sx={{ mb: { xs: 1.5, sm: 2 } }}>
								<Typography 
									variant={isMobile ? "subtitle1" : "h6"} 
									sx={{ 
										fontWeight: 700, 
										mb: { xs: 0.3, sm: 0.5 },
										fontSize: { xs: '1rem', sm: '1.25rem' },
										wordBreak: 'break-word'
									}}
								>
									{edu.degree}, {edu.year}
								</Typography>
								<Typography 
									variant="body2" 
									sx={{ 
										fontStyle: "italic", 
										mb: { xs: 0.75, sm: 1 },
										fontSize: { xs: '0.8rem', sm: '0.875rem' }
									}}
								>
									{edu.institution}, {edu.location}
								</Typography>
								{edu.highlights && (
									<Box component="ul" sx={{ ml: { xs: 2, sm: 3 } }}>
										{edu.highlights.map((highlight, highlightIndex) => (
											<Box component="li" key={highlightIndex} sx={{ mb: { xs: 0.3, sm: 0.5 } }}>
												<Typography 
													variant="body1"
													sx={{
														fontSize: { xs: '0.9rem', sm: '1rem' },
														lineHeight: { xs: 1.4, sm: 1.5 }
													}}
												>
													{highlight}
												</Typography>
											</Box>
										))}
									</Box>
								)}
							</Box>
						))}
					</Box>
				</Paper>
			)}
		</Box>
	);
};

// Export a memoized version of the component to prevent unnecessary re-renders
export default React.memo(ResumeView);
