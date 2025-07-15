export const resumePreviewTemplate = (jsonString) => {
    try {
        // Parse the JSON string to get the resume data
        let cv;
        
        // First check if jsonString is already an object
        if (typeof jsonString === 'object' && jsonString !== null) {
            cv = jsonString;
        } else {
            try {
                // First try parsing once (in case it's already a JSON string)
                cv = JSON.parse(jsonString);
                // Check if it's still a string that needs parsing
                if (typeof cv === 'string') {
                    cv = JSON.parse(cv);
                }
            } catch (parseError) {
                console.error('First parsing attempt failed:', parseError);
                // If double parsing fails, try single parsing
                cv = JSON.parse(jsonString);
            }
        }
        
        return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <title>Dynamic Résumé</title>
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            <style>
                /* ===== base layout ===== */
                body {
                    font-family: system-ui, Arial, Helvetica, sans-serif;
                    margin: 0;
                    padding: 0;
                    color: #111;
                }
                .page {
                    max-width: 780px;
                    margin: 0 auto;
                    padding: 2rem 2.2rem;
                }
                h1,
                h2,
                h3 {
                    margin: 0 0 0.4rem;
                    font-weight: 700;
                }
                h1 {
                    font-size: 1.75rem;
                }
                h2 {
                    font-size: 1.25rem;
                    margin-top: 1.1rem;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 0.2rem;
                }
                h3 {
                    font-size: 1.05rem;
                    margin-top: 0.8rem;
                }
                ul {
                    margin: 0.3rem 0 0.9rem 1.4rem;
                    padding: 0;
                }
                li {
                    margin: 0.25rem 0;
                }
                .meta {
                    font-style: italic;
                    margin-bottom: 0.8rem;
                }
                .two-col {
                    display: flex;
                    justify-content: space-between;
                    gap: 1rem;
                }
                .right {
                    text-align: right;
                }
                .tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.4rem;
                }
                .tag {
                    background: #e7f1ff;
                    padding: 0.15rem 0.5rem;
                    border-radius: 0.3rem;
                    font-size: 0.8rem;
                }

                /* ===== print friendliness ===== */
                @media print {
                    body {
                        margin: 0;
                    }
                    .page {
                        page-break-after: always;
                    }
                }
            </style>
        </head>
        <body>
            <div class="page">
                <!-- Header -->
                <h1>${cv.basics.name}</h1>
                <div class="meta">${cv.basics.headline}</div>
                <div class="meta">${cv.basics.address}<br>${cv.basics.phone} • <a href="mailto:${cv.basics.email}">${cv.basics.email}</a></div>

                <!-- Career Summary -->
                <h2>Career Summary</h2>
                <p>${cv.careerSummary}</p>

                <!-- Skills -->
                <h2>Key Skills</h2>
                <div class="tags">
                    ${cv.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
                </div>

                <!-- Achievements -->
                <h2>Achievements</h2>
                <ul>
                    ${cv.achievements.map(achievement => `<li>${achievement}</li>`).join('')}
                </ul>

                <!-- Employment History -->
                <h2>Employment History</h2>
                ${cv.employmentHistory.map(job => `
                    <div>
                        <h3>${job.title} – ${job.company}</h3>
                        <div class="meta">${job.start} – ${job.end} | ${job.location}</div>
                        <ul>
                            ${job.bullets.map(bullet => `<li>${bullet}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}

                <!-- Projects -->
                <h2>Selected Projects</h2>
                ${cv.projects.map(project => `
                    <div>
                        <h3>${project.name}</h3>
                        <div class="meta">${project.period} • ${project.tech.join(', ')}</div>
                        <p>${project.description}</p>
                    </div>
                `).join('')}

                <!-- Education -->
                <h2>Education</h2>
                ${cv.education.map(edu => `
                    <div>
                        <h3>${edu.degree}, ${edu.year}</h3>
                        <div class="meta">${edu.institution}, ${edu.location}</div>
                        ${edu.highlights ? `
                            <ul>
                                ${edu.highlights.map(highlight => `<li>${highlight}</li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </body>
    </html>
    `;
    } catch (error) {
        console.error('Error parsing JSON in resumePreviewTemplate:', error);
        return `<div style="color: red; padding: 20px;">Error rendering resume: ${error.message}</div>`;
    }
}