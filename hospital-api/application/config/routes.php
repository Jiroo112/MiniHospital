<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	https://codeigniter.com/userguide3/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There are three reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router which controller/method to use if those
| provided in the URL cannot be matched to a valid route.
|
|	$route['translate_uri_dashes'] = FALSE;
|
| This is not exactly a route, but allows you to automatically route
| controller and method names that contain dashes. '-' isn't a valid
| class or method name character, so it requires translation.
| When you set this option to TRUE, it will replace ALL dashes in the
| controller and method URI segments.
|
| Examples:	my-controller/index	-> my_controller/index
|		my-controller/my-method	-> my_controller/my_method
*/
$route['default_controller'] = 'welcome';
$route['404_override'] = '';
$route['translate_uri_dashes'] = FALSE;

// Auth Routes
$route['api/auth/register']['post'] = 'api/auth/register';
$route['api/auth/login']['post']    = 'api/auth/login';
$route['api/auth/profile']['get']   = 'api/auth/profile';

// Poli Routes
$route['api/poli']['get']             = 'api/poli/index';
$route['api/poli']['post']            = 'api/poli/create';
$route['api/poli/(:num)']['get']      = 'api/poli/detail/$1';
$route['api/poli/(:num)']['put']      = 'api/poli/update/$1';
$route['api/poli/(:num)']['delete']   = 'api/poli/delete/$1';

// Doctors Routes
$route['api/doctors']['get']           = 'api/doctors/index';
$route['api/doctors']['post']          = 'api/doctors/create';
$route['api/doctors/(:num)']['get']    = 'api/doctors/detail/$1';
$route['api/doctors/(:num)']['put']    = 'api/doctors/update/$1';
$route['api/doctors/(:num)']['delete'] = 'api/doctors/delete/$1';

// Schedules Routes
$route['api/schedules']['get']           = 'api/schedules/index';
$route['api/schedules']['post']          = 'api/schedules/create';
$route['api/schedules/(:num)']['get']    = 'api/schedules/detail/$1';
$route['api/schedules/(:num)']['put']    = 'api/schedules/update/$1';
$route['api/schedules/(:num)']['delete'] = 'api/schedules/delete/$1';

// Queue Routes
$route['api/queue/book']['post']                = 'api/queue/book';
$route['api/queue/today']['get']                = 'api/queue/today';
$route['api/queue/(:num)/status']['put']        = 'api/queue/update_status/$1';
$route['api/queue/my']['get']                   = 'api/queue/my_booking';

// Medical Records Routes
$route['api/medical-records']['post']                  = 'api/medical_records/create';
$route['api/medical-records/patient/(:num)']['get']    = 'api/medical_records/by_patient/$1';
$route['api/medical-records/(:num)']['get']            = 'api/medical_records/detail/$1';
$route['api/medical-records/my']['get']                = 'api/medical_records/my_records';