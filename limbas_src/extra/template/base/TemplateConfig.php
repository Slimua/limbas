<?php

require_once(__DIR__ . '/TemplateElement.php');
require_once(__DIR__ . '/HtmlParts/AbstractHtmlPart.php');
require_once(__DIR__ . '/HtmlParts/DataPlaceholder.php');
require_once(__DIR__ . '/HtmlParts/FunctionPlaceholder.php');
require_once(__DIR__ . '/HtmlParts/Html.php');
require_once(__DIR__ . '/HtmlParts/IfPlaceholder.php');
require_once(__DIR__ . '/HtmlParts/SubTemplateElementPlaceholder.php');

abstract class TemplateConfig {

    /**
     * @var TemplateConfig
     */
    public static $instance = null;

    public abstract function getGtabid();

    public abstract function getFunctionPrefix();

    public function getTemplateElementInstance($templateElementGtabid, $name, &$html) {
        return new TemplateElement($templateElementGtabid, $name, $html);
    }

    public abstract function getDataPlaceholderInstance($chain, $flags, $altValue);

    public function getFunctionPlaceholderInstance($name, $params) {
        return new FunctionPlaceholder($name, $params);
    }

    public function getHtmlInstance($html) {
        return new Html($html);
    }

    public function getIfPlaceholderInstance($condition, $consequent, $alternative) {
        return new IfPlaceholder($condition, $consequent, $alternative);
    }

    public function getSubTemplateElementPlaceholderInstance($name) {
        return new SubTemplateElementPlaceholder($name);
    }

}