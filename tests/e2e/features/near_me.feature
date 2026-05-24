Feature: Geo Location Navigation
  As a driver on the road
  I want to tap a Near Me button
  So that the map smoothly navigates to my geographic location

  Scenario: Pressing near me navigates the map accurately
    Given I load the fuel map dashboard with mocked geolocation
    When I press the Near Me button
    Then the map should pan to my coordinates and lock focus
