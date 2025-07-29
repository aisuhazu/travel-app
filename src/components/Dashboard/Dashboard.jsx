import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { tripAPI, userAPI } from "../../services/api";
import Navbar from "../UI/Navbar";
import TripCard from "../Trips/TripCard";
import TripModal from "../Trips/TripModal";
import { MapView } from "../Maps";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [trips, setTrips] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTripModal, setShowTripModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tripsResponse, statsResponse] = await Promise.all([
        tripAPI.getTrips(),
        userAPI.getStats(),
      ]);

      console.log('Fetched trips:', tripsResponse.data); // Add this debug line
      setTrips(tripsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add function to calculate countries visited from ongoing and completed trips only
  const calculateCountriesVisited = () => {
    const groupedTrips = getGroupedTrips();
    const ongoingAndCompletedTrips = [
      ...groupedTrips.ongoing,
      ...groupedTrips.completed
    ];
    
    const uniqueCountries = new Set();
    ongoingAndCompletedTrips.forEach(trip => {
      if (trip.country) {
        uniqueCountries.add(trip.country);
      }
    });
    
    return uniqueCountries.size;
  };

  // Add function to group and sort trips
  // Update the getGroupedTrips function with smart date-based status detection
  const getGroupedTrips = () => {
    // Debug: Log all trips and their statuses
    console.log("All trips:", trips);
    console.log(
      "Trip statuses:",
      trips.map((trip) => ({
        id: trip.id,
        status: trip.status,
        title: trip.title,
      }))
    );

    const sortByDate = (a, b) => {
      const dateA = new Date(a.start_date || a.created_at);
      const dateB = new Date(b.start_date || b.created_at);
      return dateA - dateB; // Ascending order: earliest date first
    };

    // Smart status detection based on dates
    const getSmartStatus = (trip) => {
      // If trip has explicit status, use it
      if (trip.status && trip.status !== "undefined") {
        return trip.status;
      }

      // Smart detection based on dates
      const now = new Date();
      const startDate = trip.start_date ? new Date(trip.start_date) : null;
      const endDate = trip.end_date ? new Date(trip.end_date) : null;

      if (startDate && endDate) {
        if (now < startDate) {
          return "planned";
        } else if (now >= startDate && now <= endDate) {
          return "ongoing";
        } else if (now > endDate) {
          return "completed";
        }
      } else if (startDate) {
        if (now < startDate) {
          return "planned";
        } else {
          // If only start date and it's past, assume completed
          return "completed";
        }
      }

      // Default to planned if no dates available
      return "planned";
    };

    // Group trips using smart status detection
    const groupedTrips = {
      planned: [],
      ongoing: [],
      completed: [],
    };

    trips.forEach((trip) => {
      const smartStatus = getSmartStatus(trip);
      if (groupedTrips[smartStatus]) {
        groupedTrips[smartStatus].push(trip);
      } else {
        // Fallback for any unexpected status
        groupedTrips.planned.push(trip);
      }
    });

    // Sort each group by date
    Object.keys(groupedTrips).forEach((status) => {
      groupedTrips[status].sort(sortByDate);
    });

    // Debug: Log grouped results
    console.log("Grouped trips:", groupedTrips);

    return groupedTrips;
  };

  // Add function to get status display info
  const getStatusInfo = (status) => {
    const statusConfig = {
      planned: {
        title: "📅 Planned Trips",
        variant: "primary",
        icon: "bi-calendar-plus",
        description: "Upcoming adventures",
      },
      ongoing: {
        title: "✈️ Ongoing Trips",
        variant: "success",
        icon: "bi-airplane",
        description: "Currently traveling",
      },
      completed: {
        title: "✅ Completed Trips",
        variant: "secondary",
        icon: "bi-check-circle",
        description: "Memories made",
      },
    };
    return statusConfig[status] || statusConfig.planned;
  };

  const handleCreateTrip = () => {
    setSelectedTrip(null);
    setShowTripModal(true);
  };

  const handleEditTrip = (trip) => {
    setSelectedTrip(trip);
    setShowTripModal(true);
  };

  const handleTripSaved = () => {
    setShowTripModal(false);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const groupedTrips = getGroupedTrips();

  return (
    <>
      <Navbar />
      <Container className="mt-4">
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h1>🗺️ My Travel Dashboard</h1>
              <Button variant="primary" onClick={handleCreateTrip}>
                <i className="bi bi-plus-circle me-2"></i>
                Add New Trip
              </Button>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        {stats && (
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-primary">{stats.total_trips || 0}</h3>
                  <p className="mb-0">Total Trips</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">
                    {calculateCountriesVisited()}
                  </h3>
                  <p className="mb-0">Countries Visited</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">{stats.total_likes || 0}</h3>
                  <p className="mb-0">Total Likes</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Map Overview */}
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <i className="bi bi-map me-2"></i>
                  Trip Locations Overview
                </h5>
              </Card.Header>
              <Card.Body>
                <MapView
                  trips={trips}
                  height="350px"
                  zoom={2}
                  center={{ lat: 20, lng: 0 }}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Grouped Trips by Status */}
        {trips.length === 0 ? (
          <Card className="text-center py-5">
            <Card.Body>
              <i className="bi bi-map display-1 text-muted"></i>
              <h4 className="mt-3">No trips yet!</h4>
              <p className="text-muted">
                Start documenting your adventures by creating your first trip.
              </p>
              <Button variant="primary" onClick={handleCreateTrip}>
                Create Your First Trip
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <>
            {/* Render each status group */}
            {Object.entries(groupedTrips).map(([status, statusTrips]) => {
              if (statusTrips.length === 0) return null;

              const statusInfo = getStatusInfo(status);

              return (
                <div key={status} className="mb-5">
                  {/* Status Section Header */}
                  <Row className="mb-3">
                    <Col>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <h4 className="mb-0 me-3">{statusInfo.title}</h4>
                          <Badge bg={statusInfo.variant} className="fs-6">
                            {statusTrips.length}{" "}
                            {statusTrips.length === 1 ? "trip" : "trips"}
                          </Badge>
                        </div>
                        <small className="text-muted">
                          <i className={`${statusInfo.icon} me-1`}></i>
                          {statusInfo.description}
                        </small>
                      </div>
                      <hr className="mt-2" />
                    </Col>
                  </Row>

                  {/* Status Trips Grid */}
                  <Row>
                    {statusTrips.map((trip) => (
                      <Col md={6} lg={4} key={trip.id} className="mb-4">
                        <TripCard
                          trip={trip}
                          onEdit={() => handleEditTrip(trip)}
                          onRefresh={fetchDashboardData}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              );
            })}

            {/* Fallback: Show ungrouped trips if none match the status filters */}
            {Object.values(groupedTrips).every((group) => group.length === 0) &&
              trips.length > 0 && (
                <div className="mb-5">
                  <Row className="mb-3">
                    <Col>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <h4 className="mb-0 me-3">📋 All Trips</h4>
                          <Badge bg="info" className="fs-6">
                            {trips.length}{" "}
                            {trips.length === 1 ? "trip" : "trips"}
                          </Badge>
                        </div>
                        <small className="text-muted">
                          <i className="bi bi-list me-1"></i>
                          Unsorted trips
                        </small>
                      </div>
                      <hr className="mt-2" />
                    </Col>
                  </Row>

                  <Row>
                    {trips.map((trip) => (
                      <Col md={6} lg={4} key={trip.id} className="mb-4">
                        <TripCard
                          trip={trip}
                          onEdit={() => handleEditTrip(trip)}
                          onRefresh={fetchDashboardData}
                        />
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
          </>
        )}
      </Container>

      {/* Trip Modal */}
      <TripModal
        show={showTripModal}
        onHide={() => setShowTripModal(false)}
        trip={selectedTrip}
        onSave={handleTripSaved}
      />
    </>
  );
};

export default Dashboard;
