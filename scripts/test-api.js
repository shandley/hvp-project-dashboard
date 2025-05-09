/**
 * Test script to check the NIH RePORTER API directly
 */
const https = require('https');

// Configuration for the NIH RePORTER API
const REPORTER_API_CONFIG = {
  baseUrl: 'https://api.reporter.nih.gov/v2',
  endpoints: {
    projects: '/projects/search',
    publications: '/publications/search'
  },
  // HVP grant IDs
  hvpGrantIds: [
    // Virome Characterization Centers (VCC) Grants
    'U54AG089335',
    'U54AG089323',
    'U54AG089326',
    'U54AG089325',
    'U54AG089334',
    
    // Functional Studies Grants
    'AT012990',
    'AT012984',
    'AT012970',
    'AT012998',
    'AT012993',
    
    // Tools Development Grant
    'U01DE034199'
  ],
  // Other virome-related grants
  otherViromeGrantIds: [
    'R01AI132549',  // Human enteric virome in health and disease
    'R01AI141534',  // The Oral Virome in Health and Disease
    'R01ES030150',  // The infant gut virome and neurodevelopment
    'U01DE029664'   // The oral cavity virome in HIV infection
  ]
};

/**
 * Search for publications by project numbers
 */
async function searchPublicationsByProjects(projectIds = []) {
  if (!projectIds.length) {
    console.log('No project IDs provided');
    return [];
  }

  const payload = {
    criteria: {
      project_nums: projectIds
    },
    limit: 100,
    offset: 0
  };

  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Log the request
    console.log(`Requesting publications for projects: ${projectIds.join(', ')}`);
    console.log(`Request payload: ${JSON.stringify(payload, null, 2)}`);
    
    const req = https.request(
      `${REPORTER_API_CONFIG.baseUrl}${REPORTER_API_CONFIG.endpoints.publications}`,
      options,
      (res) => {
        let data = '';
        
        // Log the response status
        console.log(`Response status: ${res.statusCode}`);
        console.log(`Response headers: ${JSON.stringify(res.headers)}`);
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsedData = JSON.parse(data);
              console.log(`Found ${parsedData.results ? parsedData.results.length : 0} publications`);
              if (parsedData.results && parsedData.results.length > 0) {
                console.log(`First publication: ${JSON.stringify(parsedData.results[0], null, 2)}`);
                
                // Log more details about all publications
                console.log(`All PMIDs: ${parsedData.results.map(pub => pub.pmid).join(', ')}`);
                
                // Log structure of a full publication object
                console.log(`Publication object structure: ${Object.keys(parsedData.results[0]).join(', ')}`);
                
                // Check if we have projects info
                if (parsedData.results[0].projects) {
                  console.log(`Project info available: ${JSON.stringify(parsedData.results[0].projects[0], null, 2)}`);
                } else {
                  console.log(`No project info available in response`);
                }
              }
              resolve(parsedData.results || []);
            } catch (error) {
              console.error('Error parsing response:', error);
              reject(error);
            }
          } else {
            console.error(`API request failed with status ${res.statusCode}`);
            console.error(`Response body: ${data}`);
            reject(new Error(`API request failed with status ${res.statusCode}`));
          }
        });
      }
    );
    
    req.on('error', (error) => {
      console.error('Error making API request:', error);
      reject(error);
    });
    
    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * Main test function
 */
async function runTests() {
  console.log('Testing NIH RePORTER API...');
  
  try {
    // Test HVP grant IDs
    console.log('\n===== Testing HVP Grant IDs =====');
    const hvpPublications = await searchPublicationsByProjects(REPORTER_API_CONFIG.hvpGrantIds);
    console.log(`Total HVP publications found: ${hvpPublications.length}`);
    
    // Test other virome grant IDs
    console.log('\n===== Testing Other Virome Grant IDs =====');
    const otherPublications = await searchPublicationsByProjects(REPORTER_API_CONFIG.otherViromeGrantIds);
    console.log(`Total Other Virome publications found: ${otherPublications.length}`);
    
    // Test a known working grant ID (as a control)
    console.log('\n===== Testing Control Grant ID (R01AI147723) =====');
    const controlPublications = await searchPublicationsByProjects(['R01AI147723']);
    console.log(`Total Control publications found: ${controlPublications.length}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
runTests();