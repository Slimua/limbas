<?php
/**
 * @copyright Limbas GmbH <https://limbas.com>
 * @license https://opensource.org/licenses/GPL-2.0 GPL-2.0
 *
 * This program is free software; you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation; either version 2 of the License, or (at your option) any later version.
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 */

namespace Limbas\extra\report;

use Mpdf\Mpdf;

class LmbMpdf extends Mpdf {

    var $rp;
    var $report;
    var $report_id;
    var $ID;
    var $headerMarginSet = false;
    var $oldCellPadding = null;

    # -------------- concat pdf ---------------------
    function concat(&$files): void
    {
        foreach ($files as $file) {
            $pagecount = $this->setSourceFile($file);
            for ($i = 1; $i <= $pagecount; $i++) {
                $tplidx = $this->ImportPage($i);
                $this->AddPage();
                $this->useTemplate($tplidx);
            }
        }
    }

    # RGB Color ----------------------------
    function make_color($val): array
    {
        $val = trim($val,'#');
        $col = [];
        $col[0] = hexdec(lmb_substr($val, 0, 2));
        $col[1] = hexdec(lmb_substr($val, 2, 2));
        $col[2] = hexdec(lmb_substr($val, 4, 2));
        return $col;
    }


}
