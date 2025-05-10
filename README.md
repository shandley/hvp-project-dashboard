<p align="center">
  <img src="HVP_logo_white.png" alt="HVP Dashboard Logo" width="200" />
</p>

# 🧬 NIH Human Virome Program Dashboard

An interactive dashboard visualizing data from the NIH Human Virome Program (HVP).

## 🔍 Project Overview

This dashboard provides visualization and exploration of data from the NIH Human Virome Program, including:
- 📊 Project distribution and status
- 🧪 Sample demographics and metrics
- 🌎 Geographic distribution of research
- 📑 Publications and scientific impact
- 🔬 Research focus and virome exploration

The dashboard is hosted using GitHub Pages at: https://shandley.github.io/hvp-project-dashboard/

## ✨ Features

- **Interactive Visualizations**: Explore HVP data through dynamic charts and graphs
- **Project Timeline**: Track project progress and key milestones
- **Publications Tracker**: View and filter HVP-related scientific publications
- **Data Export**: Download publication data for offline analysis
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Mode**: Choose your preferred visual theme

## 🛠️ Technology Stack

This project is built with:
- ⚛️ React.js for the UI framework
- 📈 D3.js and Chart.js for visualizations
- 🌐 GitHub Pages for hosting
- 🔄 GitHub Actions for automated workflows
- 🔍 iCite API for publication data
- 📑 PubMed integration for scientific metadata

## 🧪 Project Structure

```
hvp-project-dashboard/
├── public/                 # Static files and data
│   ├── data/               # JSON data files
│   │   ├── hvp-publications.json     # Publication data
│   │   ├── hvp-about.json            # Program information
│   │   └── ...                       # Other data files
├── scripts/                # Data processing scripts
│   ├── process-data.js     # CSV to JSON conversion
│   └── update-publications.js  # Publication data updater
├── src/                    # Source code
│   ├── components/         # React components
│   │   ├── Dashboard.js    # Main dashboard
│   │   ├── publications/   # Publications components
│   │   └── visualizations/ # Data visualization components
│   ├── utils/              # Utility functions
│   │   ├── dataLoader.js   # Data loading utilities
│   │   ├── exportUtils.js  # Data export utilities
│   │   └── publicationService.js # Publication API service
│   └── context/            # React context providers
│       └── ThemeContext.js # Theme (dark/light) management
└── .github/workflows/      # GitHub Actions workflows
    └── update-publications.yml # Publication data update workflow
```

## 💻 Development

### Local Development

To run the project locally:

1. Clone the repository
```
git clone https://github.com/shandley/hvp-project-dashboard.git
cd hvp-project-dashboard
```

2. Install dependencies
```
npm install
```

3. Start the development server
```
npm start
```

4. Open your browser to http://localhost:3000

### Building for Production

To build the project for GitHub Pages:
```
npm run build
```

This will create optimized production files in the `build` directory.

## 📊 Data Sources

The dashboard is based on the following data sources:
- `HVP_master.csv`: Primary data table of HVP projects
- `hvp-publications.json`: Publication data from iCite API
- Various JSON files containing program information and visualization data

## 🔄 Automated Workflows

The project uses GitHub Actions for automated processes:

### Publication Data Update
- 🤖 Nightly update of publication data via iCite API
- 📋 Integration with PubMed for publication metadata
- 🔍 Validation against ground truth publications
- 📝 Automatic update of JSON data sources

## 📝 Implementation Plans

- [GitHub Pages Implementation Plan](github_pages_implementation_plan.md)
- [Publication Analytics Future Plans](publication-analytics-future-plans.md)
- [Aesthetic Improvement Plan](aesthetic_improvement_plan.md)

## 🔜 Roadmap

Future enhancements planned for the dashboard include:

- 📊 Enhanced publication analytics and citation metrics
- 🔗 Network visualization of research collaborations
- 📱 Mobile-optimized interface improvements
- 🗂️ Additional data filtering and exploration options
- 🔄 Real-time data updates from multiple sources

## 👥 Contributing

Contributions to the HVP Dashboard are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's style guidelines and includes appropriate tests.

## 🙏 Acknowledgments

- National Institutes of Health (NIH) for funding the Human Virome Program
- All researchers and institutions participating in HVP
- The open-source community for providing fantastic tools and libraries

## 📄 License

[MIT License](LICENSE)