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

## 📄 License

[MIT License](LICENSE)