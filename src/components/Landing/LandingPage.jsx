import React from 'react';
import { Container, Row, Col, Button, Card, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <Navbar bg="white" expand="lg" className="shadow-sm fixed-top">
        <Container>
          <Navbar.Brand href="#" className="fw-bold text-primary">
            <i className="bi bi-map me-2"></i>
            Travelog
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#how-it-works">How It Works</Nav.Link>
              <Nav.Link href="#testimonials">Testimonials</Nav.Link>
              <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="display-4 fw-bold mb-4">
                  Your Journey, <span className="text-primary">Beautifully Documented</span>
                </h1>
                <p className="lead mb-4 text-muted">
                  Create stunning travel journals with interactive maps, photo galleries, 
                  and detailed itineraries. Never forget a moment of your adventures.
                </p>
                <div className="hero-buttons">
                  <Link to="/register" className="btn btn-primary btn-lg me-3">
                    Start Your Journey
                  </Link>
                  <Button variant="outline-secondary" size="lg">
                    <i className="bi bi-play-circle me-2"></i>
                    Watch Demo
                  </Button>
                </div>
                <div className="hero-stats mt-4">
                  <Row>
                    <Col xs={4}>
                      <div className="stat-item">
                        <h4 className="fw-bold text-primary">10K+</h4>
                        <small className="text-muted">Travelers</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="stat-item">
                        <h4 className="fw-bold text-primary">50K+</h4>
                        <small className="text-muted">Trips Logged</small>
                      </div>
                    </Col>
                    <Col xs={4}>
                      <div className="stat-item">
                        <h4 className="fw-bold text-primary">100+</h4>
                        <small className="text-muted">Countries</small>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                <div className="floating-card card-1">
                  <Card className="shadow-lg border-0">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-2">
                        <div className="bg-primary rounded-circle p-2 me-3">
                          <i className="bi bi-geo-alt text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-0">Tokyo, Japan</h6>
                          <small className="text-muted">March 15-22, 2024</small>
                        </div>
                      </div>
                      <div className="trip-preview">
                        <div className="bg-light rounded p-2 mb-2">
                          <small>📸 25 photos • 🗺️ 8 locations</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
                <div className="floating-card card-2">
                  <Card className="shadow-lg border-0">
                    <Card.Body>
                      <div className="d-flex align-items-center">
                        <div className="bg-success rounded-circle p-2 me-3">
                          <i className="bi bi-check-circle text-white"></i>
                        </div>
                        <div>
                          <h6 className="mb-0">Trip Completed!</h6>
                          <small className="text-muted">Paris Adventure</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="display-5 fw-bold mb-3">Everything You Need for Perfect Travel Logs</h2>
              <p className="lead text-muted">
                Powerful features designed to capture and organize your travel memories effortlessly.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={6} lg={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-primary bg-gradient rounded-circle mx-auto mb-3">
                    <i className="bi bi-map text-white"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Interactive Maps</h5>
                  <p className="text-muted">
                    Pin your locations with beautiful markers, create routes, and visualize your journey on interactive maps.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-success bg-gradient rounded-circle mx-auto mb-3">
                    <i className="bi bi-images text-white"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Photo Galleries</h5>
                  <p className="text-muted">
                    Upload and organize your travel photos with beautiful galleries and lightbox viewing.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-warning bg-gradient rounded-circle mx-auto mb-3">
                    <i className="bi bi-calendar-event text-white"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Trip Planning</h5>
                  <p className="text-muted">
                    Plan future trips, track ongoing adventures, and archive completed journeys with status tracking.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-info bg-gradient rounded-circle mx-auto mb-3">
                    <i className="bi bi-currency-dollar text-white"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Budget Tracking</h5>
                  <p className="text-muted">
                    Keep track of your travel expenses and stay within budget with built-in financial planning.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-danger bg-gradient rounded-circle mx-auto mb-3">
                    <i className="bi bi-journal-text text-white"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Rich Descriptions</h5>
                  <p className="text-muted">
                    Write detailed travel stories and experiences with expandable text and rich formatting.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="feature-card h-100 border-0 shadow-sm">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon bg-secondary bg-gradient rounded-circle mx-auto mb-3">
                    <i className="bi bi-cloud-upload text-white"></i>
                  </div>
                  <h5 className="fw-bold mb-3">Cloud Sync</h5>
                  <p className="text-muted">
                    Your memories are safely stored in the cloud and accessible from any device, anywhere.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section py-5 bg-light">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="display-5 fw-bold mb-3">How It Works</h2>
              <p className="lead text-muted">
                Get started in minutes and begin documenting your adventures.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={4}>
              <div className="step-item text-center">
                <div className="step-number bg-primary text-white rounded-circle mx-auto mb-3">
                  1
                </div>
                <h5 className="fw-bold mb-3">Create Your Account</h5>
                <p className="text-muted">
                  Sign up with email or Google in seconds. No complex setup required.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="step-item text-center">
                <div className="step-number bg-primary text-white rounded-circle mx-auto mb-3">
                  2
                </div>
                <h5 className="fw-bold mb-3">Add Your Trips</h5>
                <p className="text-muted">
                  Create trip entries with destinations, dates, photos, and detailed descriptions.
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="step-item text-center">
                <div className="step-number bg-primary text-white rounded-circle mx-auto mb-3">
                  3
                </div>
                <h5 className="fw-bold mb-3">Explore & Share</h5>
                <p className="text-muted">
                  View your trips on beautiful maps and share your travel stories with friends.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials-section py-5">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center mb-5">
              <h2 className="display-5 fw-bold mb-3">What Travelers Say</h2>
              <p className="lead text-muted">
                Join thousands of happy travelers who trust Travelog with their memories.
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={6} lg={4}>
              <Card className="testimonial-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="stars mb-3">
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                  </div>
                  <p className="mb-3">
                    "Travelog has completely changed how I document my travels. The map integration is fantastic!"
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="avatar bg-primary rounded-circle me-3">
                      <span className="text-white fw-bold">SM</span>
                    </div>
                    <div>
                      <h6 className="mb-0">Sarah Mitchell</h6>
                      <small className="text-muted">Digital Nomad</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="testimonial-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="stars mb-3">
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                  </div>
                  <p className="mb-3">
                    "Perfect for keeping track of all my family vacations. The photo galleries are beautiful!"
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="avatar bg-success rounded-circle me-3">
                      <span className="text-white fw-bold">JD</span>
                    </div>
                    <div>
                      <h6 className="mb-0">John Davis</h6>
                      <small className="text-muted">Family Traveler</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={4}>
              <Card className="testimonial-card h-100 border-0 shadow-sm">
                <Card.Body className="p-4">
                  <div className="stars mb-3">
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                    <i className="bi bi-star-fill text-warning"></i>
                  </div>
                  <p className="mb-3">
                    "As a travel blogger, this tool helps me organize my content and create stunning visual stories."
                  </p>
                  <div className="d-flex align-items-center">
                    <div className="avatar bg-info rounded-circle me-3">
                      <span className="text-white fw-bold">ER</span>
                    </div>
                    <div>
                      <h6 className="mb-0">Emma Rodriguez</h6>
                      <small className="text-muted">Travel Blogger</small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section py-5 bg-primary text-white">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h2 className="display-5 fw-bold mb-3">Ready to Start Your Journey?</h2>
              <p className="lead mb-4">
                Join thousands of travelers who are already creating beautiful travel memories with Travelog.
              </p>
              <div className="cta-buttons">
                <Link to="/register" className="btn btn-light btn-lg me-3">
                  Get Started Free
                </Link>
                <Button variant="outline-light" size="lg">
                  Learn More
                </Button>
              </div>
              <p className="mt-3 mb-0">
                <small>No credit card required • Free forever plan available</small>
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="footer-section py-4 bg-dark text-white">
        <Container>
          <Row className="g-3">
            <Col xs={12} md={6} className="text-center text-md-start">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-2">
                <i className="bi bi-map me-2"></i>
                <span className="fw-bold">Travelog</span>
              </div>
              <p className="mb-3 text-muted small">
                Your personal travel journal for documenting life's greatest adventures.
              </p>
            </Col>
            <Col xs={12} md={6} className="text-center text-md-end">
              <div className="social-links mb-3">
                <a href="#" className="text-white me-3 social-link">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="text-white me-3 social-link">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="text-white me-3 social-link">
                  <i className="bi bi-instagram"></i>
                </a>
                <a href="#" className="text-white social-link">
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
              <p className="mb-0 text-muted small">
                © 2025 Travelog. All rights reserved.
              </p>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;