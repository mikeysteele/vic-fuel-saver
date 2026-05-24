Feature: Map Interaction

  As a fuel price hunter
  I want to be able to navigate the map
  So that I can find fuel stations across Victoria

  Scenario: Viewing the initial map layout
    Given I load the fuel map dashboard
    Then the map should be visible
    And I should see fuel station markers

  Scenario: Dragging the map
    Given I load the fuel map dashboard
    When I pan the map to a new location
    Then I should see new fuel station markers load
