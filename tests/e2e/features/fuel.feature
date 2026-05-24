Feature: Fuel Analytics Pipeline
  As a user hunting for cheap fuel
  I want to filter the fuel stations by fuel type
  So that the analytics pipeline updates accurately

  Scenario: Filtering the map for E10
    Given I load the fuel map dashboard
    When I select the "E10" fuel type
    Then the metrics board should display "E10" average and cheapest prices
