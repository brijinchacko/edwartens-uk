// Mock session for testing without database
// TODO: Remove this file and use real auth when database is set up

export function getTestSession(role: "ADMIN" | "STAFF" | "STUDENT" = "STUDENT") {
  if (role === "STUDENT") {
    return {
      user: {
        id: "test-student-id",
        email: "demo@edwartens.co.uk",
        name: "Demo Student",
        role: "STUDENT",
        onboarded: true,
        image: null,
      },
    };
  }
  return {
    user: {
      id: "test-admin-id",
      email: "admin@edwartens.co.uk",
      name: "Admin User",
      role,
      onboarded: true,
      image: null,
    },
  };
}
