<?php
  function intToBool($intString) {
    if ($intString == '0') {
      return 'false';
    } else {
      return 'true';
    }
  }

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

  $stmt = oci_parse($conn, "SELECT * FROM Autobus WHERE nr_pojazdu = ".$busId);
  oci_execute($stmt, OCI_NO_AUTO_COMMIT);

  $row = oci_fetch_array($stmt, OCI_BOTH);
  $row['PRZEWOZNIK'] = str_replace('"', '\"', $row['PRZEWOZNIK']);
  $row['ZAJEZDNIA'] = str_replace('"', '\"', $row['ZAJEZDNIA']);
  $row['PRODUCENT'] = str_replace('"', '\"', $row['PRODUCENT']);
  $row['MODEL'] = str_replace('"', '\"', $row['MODEL']);
  $row['NR_REJESTRACYJNY'] = str_replace('"', '\"', $row['NR_REJESTRACYJNY']);

  echo '{"code": 200, "bus": {';
  echo '  "nr_pojazdu":'.$row['NR_POJAZDU'].',';
  echo '  "przewoznik":"'.$row['PRZEWOZNIK'].'",';
  echo '  "zajezdnia":"'.$row['ZAJEZDNIA'].'",';
  echo '  "producent":"'.$row['PRODUCENT'].'",';
  echo '  "model":"'.$row['MODEL'].'",';
  echo '  "rok_produkcji":'.$row['ROK_PRODUKCJI'].',';
  echo '  "nr_rejestracyjny":"'.$row['NR_REJESTRACYJNY'].'",';
  echo '  "niska_podloga":'.intToBool($row['NISKA_PODŁOGA']).',';
  echo '  "zapowiadanie_przystankow":'.intToBool($row['ZAPOWIADANIE_PRZYSTANKOW']).',';
  echo '  "tablice_elektroniczne":'.intToBool($row['TABLICE_ELEKTRONICZNE']).',';
  echo '  "cieple_guziki":'.intToBool($row['CIEPLE_GUZIKI']).',';
  echo '  "monitoring":'.intToBool($row['MONITORING']).',';
  echo '  "biletomat":'.intToBool($row['BILETOMAT']).',';
  echo '  "klimatyzacja":'.intToBool($row['KLIMATYZACJA']);
  echo '}}';

  http_response_code(200);

  exit();
?>
