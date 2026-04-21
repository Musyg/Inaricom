@echo off
REM Installation propre des 11 skills selectionnes (avec Motion.dev, pas secondsky/motion)
REM Script relatif depuis C:\Users\gimu8\Desktop\Inaricom\.claude\skills

cd /d C:\Users\gimu8\Desktop\Inaricom\.claude\skills

echo === 1. taste-skill (Leonxlnx) ===
xcopy /E /I /Q /Y _tmp_taste\skills\taste-skill taste-skill\
echo.

echo === 2. motion-dev (199-biotechnologies) ===
REM Ce repo a SKILL.md a la racine, on copie le tout
mkdir motion-dev 2>nul
copy /Y _tmp_motion\SKILL.md motion-dev\SKILL.md
xcopy /E /I /Q /Y _tmp_motion\templates motion-dev\templates\
xcopy /E /I /Q /Y _tmp_motion\examples motion-dev\examples\
xcopy /E /I /Q /Y _tmp_motion\reference motion-dev\reference\
xcopy /E /I /Q /Y _tmp_motion\schema motion-dev\schema\
xcopy /E /I /Q /Y _tmp_motion\scripts motion-dev\scripts\ 2>nul
echo.

echo === 3. design-motion-principles (kylezantos) ===
xcopy /E /I /Q /Y _tmp_motion_principles\skills\design-motion-principles design-motion-principles\
echo.

echo === 4. r3f-best-practices (emalorenzo) ===
xcopy /E /I /Q /Y _tmp_r3f\skills\r3f-best-practices r3f-best-practices\
echo.

echo === 5. three-best-practices (emalorenzo - bonus) ===
xcopy /E /I /Q /Y _tmp_r3f\skills\three-best-practices three-best-practices\
echo.

echo === 6. webgpu-threejs-tsl (dgreenheck) ===
xcopy /E /I /Q /Y _tmp_webgpu\skills\webgpu-threejs-tsl webgpu-threejs-tsl\
echo.

echo === 7. tailwind-v4-shadcn (secondsky) ===
xcopy /E /I /Q /Y _tmp_secondsky\plugins\tailwind-v4-shadcn\skills\tailwind-v4-shadcn tailwind-v4-shadcn\
echo.

echo === 8. woocommerce-backend-dev (secondsky) ===
xcopy /E /I /Q /Y _tmp_secondsky\plugins\woocommerce-backend-dev\skills\woocommerce-backend-dev woocommerce-backend-dev\
echo.

echo === 9. wordpress-plugin-core (secondsky) ===
xcopy /E /I /Q /Y _tmp_secondsky\plugins\wordpress-plugin-core\skills wordpress-plugin-core\
echo.

echo === 10. design-system-creation (secondsky) ===
xcopy /E /I /Q /Y _tmp_secondsky\plugins\design-system-creation\skills design-system-creation\
echo.

echo === 11. interaction-design (secondsky) ===
xcopy /E /I /Q /Y _tmp_secondsky\plugins\interaction-design\skills interaction-design\
echo.

echo === DONE ===
