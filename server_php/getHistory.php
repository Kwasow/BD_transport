<?php
  // Set default values
  header("Content-Type: application/json");
  header("Access-Control-Allow-Origin: *");
  http_response_code(500);

  if (!isset($_GET['busId'])) {
    http_response_code(400);
    echo '{"code": "400", "info": "missing parameter busId"}';
    exit();
  }

  $busId = $_GET['busId'];

  $passowrd = file_get_contents('./oracle_password', false, null, 0, 12);

  $conn = oci_connect("kw438800", $passowrd, "//labora.mimuw.edu.pl/LABS");
  if (!$conn) {
    http_response_code(500);
    echo '{"code": 500, "info": "internal server error"}';
    exit();
  }

  $stmt = oci_parse($conn, "SELECT * FROM Przejazd WHERE autobus = ".$busId);
  oci_execute($stmt, OCI_NO_AUTO_COMMIT);

  $first = true;

  echo '{"code": 200, "buses": [';
  while (($row = oci_fetch_array($stmt, OCI_BOTH))) {
    if ($first) {
      $first = false;
    } else {
      echo ',';
    }

    $row['AKTUALNA_POZYCJA_X'] = str_replace(',', '.', $row['AKTUALNA_POZYCJA_X']);
    $row['AKTUALNA_POZYCJA_Y'] = str_replace(',', '.', $row['AKTUALNA_POZYCJA_Y']);

    echo '{';
    echo '  "linia":"'.$row['LINIA'].'",';
    echo '  "autobus":"'.$row['AUTOBUS'].'",';
    echo '  "czas_start":"'.$row['CZAS_START'].'",';
    echo '  "czas_koniec":"'.$row['CZAS_KONIEC'].'",';
    echo '  "aktualna_pozycja_x":'.$row['AKTUALNA_POZYCJA_X'].',';
    echo '  "aktualna_pozycja_y":'.$row['AKTUALNA_POZYCJA_Y'];
    echo '}';
  }
  echo ']}';

  http_response_code(200);

  exit();
?>
