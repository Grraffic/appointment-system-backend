import { useState, useEffect, useCallback } from "react";

const useAppointment = () => {
  // States for data fetching
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for filtering and search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Filter by");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // Function to determine status color
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-[#F3BC62]";
      case "APPROVED":
        return "bg-[#299057]";
      case "REJECTED":
        return "bg-[#D52121]";
      case "COMPLETED":
        return "bg-[#354CCE]";
      default:
        return "bg-gray-500";
    }
  };

  // Function to determine transaction number color
  const getTransactionNumberColor = (status) => {
    switch (status) {
      case "PENDING":
        return "text-[#F3BC62]";
      case "APPROVED":
        return "text-[#299057]";
      case "REJECTED":
        return "text-[#D52121]";
      case "COMPLETED":
        return "text-[#354CCE]";
      default:
        return "text-gray-500";
    }
  };

  // Filter appointments based on search term and status filter
  const filteredAppointments = appointments.filter((data) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch =
      data.transactionNumber?.toLowerCase().includes(searchString) ||
      data.request?.toLowerCase().includes(searchString) ||
      data.emailAddress?.toLowerCase().includes(searchString);

    const matchesFilter =
      selectedFilter === "Filter by" ||
      data.status === selectedFilter.toUpperCase();

    return matchesSearch && matchesFilter;
  });

  // Calculate pagination values
  const totalFilteredEntries = filteredAppointments.length;
  const calculatedTotalPages = Math.ceil(totalFilteredEntries / entriesPerPage);
  const startEntry =
    totalFilteredEntries > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0;
  const endEntry = Math.min(currentPage * entriesPerPage, totalFilteredEntries);

  // Generate page numbers array
  const pageNumbers = [];
  if (calculatedTotalPages > 0) {
    for (let i = 1; i <= calculatedTotalPages; i++) {
      pageNumbers.push(i);
    }
  }

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleEntriesPerPageChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setEntriesPerPage(value);
      setCurrentPage(1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < calculatedTotalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Modal handlers
  const openModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedAppointment(null);
    setIsModalOpen(false);
  };

  // Appointment status handlers
  const deleteAppointment = async () => {
    try {
      const response = await fetch(
        `/api/document-requests/docs/${selectedAppointment.transactionNumber}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete appointment");

      setAppointments(
        appointments.filter(
          (appt) =>
            appt.transactionNumber !== selectedAppointment.transactionNumber
        )
      );
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateAppointmentStatus = async (appointment, newStatus) => {
    try {
      // Add API call to update appointment status
      const response = await fetch(
        `/api/status/${appointment.transactionNumber}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) throw new Error("Failed to update appointment status");

      const updatedStatus = await response.json();

      setAppointments(
        appointments.map((appt) =>
          appt.transactionNumber === appointment.transactionNumber
            ? { ...appt, status: newStatus }
            : appt
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const approveAppointment = (appointment) =>
    updateAppointmentStatus(appointment, "APPROVED");
  const rejectAppointment = (appointment) =>
    updateAppointmentStatus(appointment, "REJECTED");
  const completeAppointment = (appointment) =>
    updateAppointmentStatus(appointment, "COMPLETED");

  // Fetch data
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch student records first
        const studentsResponse = await fetch(
          "/api/document-requests/docs-with-details"
        );
        if (!studentsResponse.ok) {
          throw new Error(`HTTP error! status: ${studentsResponse.status}`);
        }
        const studentsData = await studentsResponse.json();

        // Fetch all appointment statuses
        const statusResponse = await fetch("/api/status");
        const statusData = await statusResponse.json();

        // Create a map of transaction numbers to their status
        const statusMap = statusData.reduce((acc, curr) => {
          acc[curr.transactionNumber] = curr.status;
          return acc;
        }, {}); // Transform student records and merge with status
        const transformedAppointments = studentsData.map((student) => ({
          id: student.transactionNumber,
          status: statusMap[student.transactionNumber] ?? "PENDING", // Use nullish coalescing to ensure PENDING is default
          transactionNumber: student.transactionNumber,
          request: student.request,
          emailAddress: student.email,
          dateOfAppointment: "", // To be filled when approved
          timeSlot: "", // To be filled when approved
          dateOfRequest: student.date,
          name: student.name,
          program: student.program,
          contact: student.contact,
        }));

        setAppointments(transformedAppointments);
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        setError(err.message || "An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(fetchAppointments, 30000);

    return () => clearInterval(refreshInterval);
  }, []);

  return {
    // Data states
    appointments,
    loading,
    error,

    // Pagination states
    currentPage,
    entriesPerPage,
    totalFilteredEntries,
    calculatedTotalPages,
    startEntry,
    endEntry,
    pageNumbers,

    // Filtered data
    filteredAppointments,

    // Handlers
    handleSearchChange,
    handleFilterChange,
    handleEntriesPerPageChange,
    handleNextPage,
    handlePreviousPage,
    handlePageChange,

    // Search and filter states
    searchTerm,
    selectedFilter,

    // Modal states and handlers
    isModalOpen,
    selectedAppointment,
    openModal,
    closeModal,

    // Status handlers
    deleteAppointment,
    approveAppointment,
    rejectAppointment,
    completeAppointment,

    // Style helpers
    getStatusColor,
    getTransactionNumberColor,

    // Sidebar states and handlers
    isSidebarOpen,
    toggleSidebar,
  };
};

export default useAppointment;
