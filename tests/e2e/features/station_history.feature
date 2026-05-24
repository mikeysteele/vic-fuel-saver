Feature: Station History Analytics
  As a fuel analyst
  I want to expand a fuel station card
  So I can see visual line graphs capturing previous trends

  Scenario: Unlocking the history modal
    Given I am viewing the list of fuel stations
    When I expand the first station card's history
    Then I should see the history visualization modal
    And the station history should accurately execute a D1 fetch
