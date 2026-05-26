USE pyme;
DELIMITER //
CREATE PROCEDURE CalcularComisionesEspeciales()
BEGIN
    DECLARE c1 CURSOR FOR 
        SELECT numem from EMPLEADOS where numde = 112;
    DECLARE v_numem INT;
	DECLARE fin boolean;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET fin = FALSE;
    open c1;
    fetch c1 INTO v_numem;
    while fin = FALSE do
    	IF (SELECT numhi FROM empleados WHERE numem = v_numem) > 2 THEN
    		UPDATE empleados SET comis = comis + 150 WHERE numem = v_numem;
		ELSE IF (SELECT numhi FROM empleados WHERE numem = v_numem) < 3 AND (SELECT numhi FROM empleados WHERE numem = v_numem) > 0 THEN
			UPDATE empleados SET comis = comis + 75 WHERE numem = v_numem;
		ELSE IF (SELECT numhi FROM empleados WHERE numem = v_numem) = 0 OR (SELECT comis FROM empleados WHERE numem = v_numem) > 100 THEN
			UPDATE empleados SET comis = comis WHERE numem = v_numem;
		ELSE IF (SELECT comis FROM empleados WHERE numem = v_numem) IS NULL THEN
			UPDATE empleados SET comis = 0 WHERE numem = v_numem;
		END IF;
		FETCH c1 INTO v_numem
    END while;
	CLOSE c1;
END //
DELIMITER ;
SELECT * from EMPLEADOS WHERE numde = 112;