Feature: List notes

  Scenario: See seeded notes in the list
    Given a note exists with title "Alpha Note"
    And a note exists with title "Beta Note"
    And I am on "/notes"
    Then I should see "Alpha Note"
    And I should see "Beta Note"

  Scenario: Pagination shows Load more
    Given a note exists with title "Note 1"
    And a note exists with title "Note 2"
    And a note exists with title "Note 3"
    And I am on "/notes?limit=2"
    Then I should see "Load more"
