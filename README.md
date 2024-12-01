# TMDB API Project

## Overview

The **TMDB API Project** is a robust application built with **NestJS** that integrates with the [TMDB API](https://www.themoviedb.org/documentation/api) to fetch and persist movie data. The project leverages modern design patterns and scalable architecture to provide efficient movie management and querying capabilities.

## Features

- **Movie Discovery**: Fetch movies based on configurable filters like vote count, vote average, release date, and more.
- **Movie Details**: Retrieve detailed information about a specific movie from TMDB.
- **Pagination Support**: Efficient querying with pagination for movie lists.
- **Validation and Exception Handling**: Ensures robust error handling and input validation.
- **Retry Mechanism**: Handles TMDB API rate limits (429 status codes) with automatic retries.
- **Scalable Architecture**: Modular design with separation of concerns for better maintainability.
- **Database Integration**: Persists movie data using MongoDB.
- **Unit and Integration Testing**: Comprehensive test coverage with Jest.

---

## Tech Stack

- **Backend Framework**: [NestJS](https://nestjs.com/)
- **Database**: MongoDB
- **HTTP Client**: Axios (via NestJS `HttpService`)
- **Testing**: Jest
- **Validation**: class-validator, class-transformer
- **Containerization**: Docker

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Docker](https://www.docker.com/)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up `.env` file:  
   Create a `.env` file in the root directory and define the required environment variables:

   ```env
   MONGO_URI=mongodb://localhost:27017/tmdb_db
   MONGO_TEST_URI=mongodb://localhost:27018/tmdb_test_db
   TMDB_API_KEY=YOUR_API_KEY
   ```

3. Start the MongoDB database using Docker:

   ```bash
   docker-compose up -d
   ```

4. Run the application:
   ```bash
   npm run start:dev
   ```
5. Access the application docs at:  
   [http://localhost:3000/docs](http://localhost:3000/docs)

### Running Tests

1. Run all tests:
   ```bash
   npm run test
   ```
2. Run tests in watch mode:

   ```bash
   npm run test:watch
   ```

3. Generate coverage report:
   ```bash
   npm run test:cov
   ```
4. Debugging failing tests:
   ```bash
   npm run test -- --detectOpenHandles
   ```
