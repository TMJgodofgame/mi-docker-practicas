USE pyme;
DELIMITTER //
CREATE function fn_comision_real(numeroemp INT) returns int
BEGIN
    DECLARE return1 int;
    IF (SELECT comis from EMPLEADOS where numem = numeroemp) not EXISTS THEN
        SET return1 = -1;
    end if;
    IF (SELECT comis FROM EMPLEADOS where numem = numeroemp) is NULL THEN
        SET return1 = 0
    else
        SET return1 = (SELECT comis from EMPLEADOS where numem = numeroemp);
    end if;
    return return1;
END //
DELIMITTER ;

SELECT * FROM EMPLEADOS WHERE Numem = 110;

SELECT fn_comision_real(110);