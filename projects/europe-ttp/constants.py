
from __future__ import absolute_import

import os
import json
from google.appengine.api import app_identity

SUPPORT_WEBSITE_URL =  "http://support-us.artofliving.org"
# SUPPORT_WEBSITE_URL =  "http://aolf.co/support"

# 2022-02-13: Changed to use FREE account
SENDGRID_API_KEY = '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'
# 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 # PROD - 2022-02-13
# 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 # AOLTTCDeskGAE

HARMONY_SEARCH_API_KEY = '56499d8fcaa45b2d050000017705d9a0f89941bb7546ea0a6d3e0ac4'

DEFAULT_PHOTO_URL = "/images/default_photo.jpg" 

app_id =  app_identity.get_application_id()

if app_id == "artofliving-ttcdesk-in":
    BUCKET_NAME = "artofliving-ttcdesk-in"
elif app_id == "artofliving-ttcdesk-dev":
    BUCKET_NAME = "artofliving-ttcdesk-dev.appspot.com"
else:
    BUCKET_NAME = "artofliving-ttcdesk.appspot.com"

IS_DEV = 'N' if "dev" not in app_id else 'Y'

CLOUD_STORAGE_LOCATION = '/' + BUCKET_NAME + '/'

SYSTEM_CONFIG_FOLDER = 'config/'
SYSTEM_CONFIG_LOCATION = CLOUD_STORAGE_LOCATION + SYSTEM_CONFIG_FOLDER

USER_CONFIG_FOLDER = 'user_data/'
USER_CONFIG_LOCATION = CLOUD_STORAGE_LOCATION + USER_CONFIG_FOLDER

USER_PHOTO_FOLDER = USER_CONFIG_FOLDER + 'photos/'
USER_PHOTO_LOCATION = CLOUD_STORAGE_LOCATION + USER_PHOTO_FOLDER

USER_SUMMARY_FOLDER = USER_CONFIG_FOLDER + 'summary/'
USER_SUMMARY_LOCATION = CLOUD_STORAGE_LOCATION + USER_SUMMARY_FOLDER
USER_SUMMARY_BY_FORM_TYPE_FILENAME = 'user_summary_by_form_type.json'
USER_SUMMARY_BY_USER_FILENAME = 'user_summary_by_user.json'
USER_SUMMARY_BY_FORM_TYPE = USER_SUMMARY_LOCATION + USER_SUMMARY_BY_FORM_TYPE_FILENAME
USER_SUMMARY_BY_USER = USER_SUMMARY_LOCATION + USER_SUMMARY_BY_USER_FILENAME

USER_INTEGRITY_FOLDER = USER_CONFIG_FOLDER + 'integrity/'
USER_INTEGRITY_LOCATION = CLOUD_STORAGE_LOCATION + USER_INTEGRITY_FOLDER
USER_INTEGRITY_BY_FORM_TYPE_FILENAME = 'user_integrity_by_form_type.json'
USER_INTEGRITY_BY_USER_FILENAME = 'user_integrity_by_user.json'
USER_INTEGRITY_BY_USER = USER_INTEGRITY_LOCATION + USER_INTEGRITY_BY_USER_FILENAME
APPLICANT_ENROLLED_LIST_FILENAME = 'applicant_enrolled_list.csv'
APPLICANT_ENROLLED_LIST = USER_INTEGRITY_LOCATION + APPLICANT_ENROLLED_LIST_FILENAME


FORM_CONFIG_LOCATION = SYSTEM_CONFIG_LOCATION + 'forms/'

ADMIN_CONFIG_FILE = SYSTEM_CONFIG_LOCATION + 'admin_config.json'

TEMP_FILES_LOCATION = CLOUD_STORAGE_LOCATION + 'tmp/'

BLANK = '__blank__'

DATA_RETENTION_DAYS = 730

COUNTRIES = '''[{"iso_abbr":"AF","languages":["ps","uz","tk"],"name":"Afghanistan"},{"iso_abbr":"AL","languages":["sq"],"name":"Albania"},{"iso_abbr":"DZ","languages":["ar","fr"],"name":"Algeria"},{"iso_abbr":"AD","languages":["ca"],"name":"Andorra"},{"iso_abbr":"AO","languages":["pt"],"name":"Angola"},{"iso_abbr":"AG","languages":["en"],"name":"Antigua and Barbuda"},{"iso_abbr":"AR","languages":["es","gn"],"name":"Argentina"},{"iso_abbr":"AM","languages":["hy","ru"],"name":"Armenia"},{"iso_abbr":"AU","languages":["en"],"name":"Australia"},{"iso_abbr":"AT","languages":["de","hr","sl","cs","hu","sk","ro"],"name":"Austria"},{"iso_abbr":"AZ","languages":["az","hy"],"name":"Azerbaijan"},{"iso_abbr":"BS","languages":["en"],"name":"Bahamas"},{"iso_abbr":"BH","languages":["ar"],"name":"Bahrain"},{"iso_abbr":"BD","languages":["bn"],"name":"Bangladesh"},{"iso_abbr":"BB","languages":["en"],"name":"Barbados"},{"iso_abbr":"BY","languages":["be","ru"],"name":"Belarus"},{"iso_abbr":"BE","languages":["nl","fr","de"],"name":"Belgium"},{"iso_abbr":"BZ","languages":["en","es"],"name":"Belize"},{"iso_abbr":"BJ","languages":["fr"],"name":"Benin"},{"iso_abbr":"BT","languages":["dz"],"name":"Bhutan"},{"iso_abbr":"BO","languages":["es","ay","qu"],"name":"Bolivia"},{"iso_abbr":"BA","languages":["bs","hr","sr"],"name":"Bosnia and Herzegovina"},{"iso_abbr":"BW","languages":["en","tn"],"name":"Botswana"},{"iso_abbr":"BR","languages":["pt","de"],"name":"Brazil"},{"iso_abbr":"BN","languages":["ml"],"name":"Brunei"},{"iso_abbr":"BG","languages":["bg"],"name":"Bulgaria"},{"iso_abbr":"BF","languages":["fr","ff"],"name":"Burkina Faso"},{"iso_abbr":"BI","languages":["fr","rn"],"name":"Burundi"},{"iso_abbr":"KH","languages":["km"],"name":"Cambodia"},{"iso_abbr":"CM","languages":["en","fr"],"name":"Cameroon"},{"iso_abbr":"CA","languages":["en","fr","cr","iu"],"name":"Canada"},{"iso_abbr":"CV","languages":["pt"],"name":"Cape Verde"},{"iso_abbr":"CF","languages":["fr","sg"],"name":"Central African Republic"},{"iso_abbr":"TD","languages":["ar","fr"],"name":"Chad"},{"iso_abbr":"CL","languages":["es"],"name":"Chile"},{"iso_abbr":"CN","languages":["zh"],"name":"China"},{"iso_abbr":"CO","languages":["es"],"name":"Colombia"},{"iso_abbr":"KM","languages":["ar","fr"],"name":"Comoros"},{"iso_abbr":"CD","languages":["fr","ln"],"name":"Republic of the Congo"},{"iso_abbr":"CR","languages":["es"],"name":"Costa Rica"},{"iso_abbr":"CI","languages":["fr"],"name":"Cote d'Ivoire"},{"iso_abbr":"HR","languages":["hr","it"],"name":"Croatia"},{"iso_abbr":"CU","languages":["es"],"name":"Cuba"},{"iso_abbr":"CY","languages":["el","tr","hy"],"name":"Cyprus"},{"iso_abbr":"CZ","languages":["cs","sk"],"name":"Czech Republic"},{"iso_abbr":"DK","languages":["da","fo","de","kl"],"name":"Denmark"},{"iso_abbr":"DJ","languages":["ar","fr"],"name":"Djibouti"},{"iso_abbr":"DM","languages":["en"],"name":"Dominica"},{"iso_abbr":"DO","languages":["es"],"name":"Dominican Republic"},{"iso_abbr":"TL","languages":["pt"],"name":"Timor Leste"},{"iso_abbr":"EC","languages":["es"],"name":"Ecuador"},{"iso_abbr":"EG","languages":["ar"],"name":"Egypt"},{"iso_abbr":"SV","languages":["es"],"name":"El Salvador"},{"iso_abbr":"GQ","languages":["es","fr"],"name":"Equatorial Guinea"},{"iso_abbr":"ER","languages":["ar","ti"],"name":"Eritrea"},{"iso_abbr":"EE","languages":["et","ru"],"name":"Estonia"},{"iso_abbr":"ET","languages":["am","en"],"name":"Ethiopia"},{"iso_abbr":"FJ","languages":["en","fj"],"name":"Fiji"},{"iso_abbr":"FI","languages":["fi","sv","se"],"name":"Finland"},{"iso_abbr":"FR","languages":["fr","co","br"],"name":"France"},{"iso_abbr":"GA","languages":["fr"],"name":"Gabon"},{"iso_abbr":"GM","languages":["en"],"name":"Gambia"},{"iso_abbr":"GE","languages":["ab","ka","os","ru"],"name":"Georgia"},{"iso_abbr":"DE","languages":["de","da","ro"],"name":"Germany"},{"iso_abbr":"GH","languages":["en","ee","tw"],"name":"Ghana"},{"iso_abbr":"GR","languages":["el"],"name":"Greece"},{"iso_abbr":"GD","languages":["en"],"name":"Grenada"},{"iso_abbr":"GT","languages":["es"],"name":"Guatemala"},{"iso_abbr":"GN","languages":["fr","ff"],"name":"Guinea"},{"iso_abbr":"GN","languages":["pt"],"name":"Guinea"},{"iso_abbr":"GY","languages":["en"],"name":"Guyana"},{"iso_abbr":"HT","languages":["fr","ht"],"name":"Haiti"},{"iso_abbr":"HN","languages":["es","en"],"name":"Honduras"},{"iso_abbr":"HU","languages":["hu"],"name":"Hungary"},{"iso_abbr":"IS","languages":["is"],"name":"Iceland"},{"iso_abbr":"IN","languages":["en","as","bn","fr","gu","hi","kn","ks","ml","mr","ne","or","pa","sa","sd","ta","te","ur"],"name":"India"},{"iso_abbr":"ID","languages":["id","jv","ml","su"],"name":"Indonesia"},{"iso_abbr":"IR","languages":["fa","ku","ar"],"name":"Iran"},{"iso_abbr":"IQ","languages":["ar","ku"],"name":"Iraq"},{"iso_abbr":"IE","languages":["ga","en"],"name":"Ireland"},{"iso_abbr":"IL","languages":["he","ar"],"name":"Israel"},{"iso_abbr":"IT","languages":["it","sq","ca","hr","fr","de","el","sc","sl","en"],"name":"Italy"},{"iso_abbr":"JM","languages":["en"],"name":"Jamaica"},{"iso_abbr":"JP","languages":["ja"],"name":"Japan"},{"iso_abbr":"JO","languages":["ar","en"],"name":"Jordan"},{"iso_abbr":"KZ","languages":["kk","ru"],"name":"Kazakhstan"},{"iso_abbr":"KE","languages":["en","sw"],"name":"Kenya"},{"iso_abbr":"KI","languages":["en"],"name":"Kiribati"},{"iso_abbr":"KP","languages":["ko"],"name":"North Korea"},{"iso_abbr":"KR","languages":["ko"],"name":"South Korea"},{"iso_abbr":"KW","languages":["ar"],"name":"Kuwait"},{"iso_abbr":"KG","languages":["ky","ru"],"name":"Kyrgyzstan"},{"iso_abbr":"LA","languages":["lo"],"name":"Laos"},{"iso_abbr":"LV","languages":["lv","ru"],"name":"Latvia"},{"iso_abbr":"LB","languages":["ar","fr","hy"],"name":"Lebanon"},{"iso_abbr":"LS","languages":["en","st"],"name":"Lesotho"},{"iso_abbr":"LR","languages":["en"],"name":"Liberia"},{"iso_abbr":"LY","languages":["ar"],"name":"Libya"},{"iso_abbr":"LI","languages":["de"],"name":"Liechtenstein"},{"iso_abbr":"LT","languages":["lt"],"name":"Lithuania"},{"iso_abbr":"LU","languages":["fr","de","lb"],"name":"Luxembourg"},{"iso_abbr":"MK","languages":["mk","sq","tr"],"name":"Macedonia"},{"iso_abbr":"MG","languages":["fr","en","mg"],"name":"Madagascar"},{"iso_abbr":"MW","languages":["ny","en"],"name":"Malawi"},{"iso_abbr":"MY","languages":["ml","en"],"name":"Malaysia"},{"iso_abbr":"MV","languages":["dv"],"name":"Maldives"},{"iso_abbr":"ML","languages":["fr"],"name":"Mali"},{"iso_abbr":"MT","languages":["mt","en","it"],"name":"Malta"},{"iso_abbr":"MH","languages":["en","mh"],"name":"Marshall Islands"},{"iso_abbr":"MR","languages":["ar","fr","ff","wo"],"name":"Mauritania"},{"iso_abbr":"MU","languages":["en"],"name":"Mauritius"},{"iso_abbr":"MX","languages":["es"],"name":"Mexico"},{"iso_abbr":"FM","languages":["en"],"name":"Federated States of Micronesia"},{"iso_abbr":"MD","languages":["ro","ru","uk"],"name":"Moldova"},{"iso_abbr":"MC","languages":["fr"],"name":"Monaco"},{"iso_abbr":"MN","languages":["mn"],"name":"Mongolia"},{"iso_abbr":"ME","languages":["sq","bs","hr","sr"],"name":"Montenegro"},{"iso_abbr":"MA","languages":["ar"],"name":"Morocco"},{"iso_abbr":"MZ","languages":["pt"],"name":"Mozambique"},{"iso_abbr":"MM","languages":["my"],"name":"Myanmar"},{"iso_abbr":"NA","languages":["en","af","de"],"name":"Namibia"},{"iso_abbr":"NR","languages":["en"],"name":"Nauru"},{"iso_abbr":"NP","languages":["ne"],"name":"Nepal"},{"iso_abbr":"NL","languages":["nl","li","en"],"name":"Netherlands"},{"iso_abbr":"NZ","languages":["en"],"name":"New Zealand"},{"iso_abbr":"NI","languages":["es"],"name":"Nicaragua"},{"iso_abbr":"NE","languages":["fr","ha","kr"],"name":"Niger"},{"iso_abbr":"NG","languages":["en","ha","yo","ig"],"name":"Nigeria"},{"iso_abbr":"NO","languages":["no","se","ro"],"name":"Norway"},{"iso_abbr":"OM","languages":["ar"],"name":"Oman"},{"iso_abbr":"PK","languages":["ur","en","pa","ps","sd"],"name":"Pakistan"},{"iso_abbr":"PW","languages":["en","ja"],"name":"Palau"},{"iso_abbr":"PS","languages":["ar"],"name":"Palestinian Authority"},{"iso_abbr":"PA","languages":["es"],"name":"Panama"},{"iso_abbr":"PG","languages":["en","ho"],"name":"Papua New Guinea"},{"iso_abbr":"PY","languages":["es","gn"],"name":"Paraguay"},{"iso_abbr":"PE","languages":["es","ay","qu"],"name":"Peru"},{"iso_abbr":"PH","languages":["ar","en","es","tl"],"name":"Philippines"},{"iso_abbr":"PL","languages":["pl","de","lt"],"name":"Poland"},{"iso_abbr":"PT","languages":["pt"],"name":"Portugal"},{"iso_abbr":"QA","languages":["ar"],"name":"Qatar"},{"iso_abbr":"RO","languages":["ro","hy"],"name":"Romania"},{"iso_abbr":"RU","languages":["ru","hy","av","az","ba","ce","cv","kv","os","tt"],"name":"Russia"},{"iso_abbr":"RW","languages":["en","fr","rw"],"name":"Rwanda"},{"iso_abbr":"KN","languages":["en"],"name":"Saint Kitts and Nevis"},{"iso_abbr":"LC","languages":["en"],"name":"Saint Lucia"},{"iso_abbr":"VC","languages":["en"],"name":"Saint Vincent and the Grenadines"},{"iso_abbr":"WS","languages":["en","sm"],"name":"Samoa"},{"iso_abbr":"SM","languages":["it"],"name":"San Marino"},{"iso_abbr":"ST","languages":["pt"],"name":"Sao Tome and Principe"},{"iso_abbr":"SA","languages":["ar"],"name":"Saudi Arabia"},{"iso_abbr":"SN","languages":["fr","ff","wo"],"name":"Senegal"},{"iso_abbr":"RS","languages":["sr","sq","hr","hu","ro","sk"],"name":"Serbia"},{"iso_abbr":"SC","languages":["en","fr"],"name":"Seychelles"},{"iso_abbr":"SL","languages":["en"],"name":"Sierra Leone"},{"iso_abbr":"SG","languages":["en","ml","zh","ta"],"name":"Singapore"},{"iso_abbr":"SK","languages":["sk"],"name":"Slovakia"},{"iso_abbr":"SI","languages":["sl","hu","it"],"name":"Slovenia"},{"iso_abbr":"SB","languages":["en"],"name":"Solomon Islands"},{"iso_abbr":"SO","languages":["so","ar"],"name":"Somalia"},{"iso_abbr":"ZA","languages":["af","en","st","ts","tn","ve","xh"],"name":"South Africa"},{"iso_abbr":"ES","languages":["es","ca","gl","eu","oc"],"name":"Spain"},{"iso_abbr":"LK","languages":["si","ta"],"name":"Sri Lanka"},{"iso_abbr":"SD","languages":["ar","en"],"name":"Sudan"},{"iso_abbr":"SR","languages":["nl"],"name":"Suriname"},{"iso_abbr":"SZ","languages":["en"],"name":"Swaziland"},{"iso_abbr":"SE","languages":["sv","fi","ro","se","yi"],"name":"Sweden"},{"iso_abbr":"CH","languages":["de","fr","it","rm"],"name":"Switzerland"},{"iso_abbr":"SY","languages":["ar"],"name":"Syria"},{"iso_abbr":"TJ","languages":["tg","ru"],"name":"Tajikistan"},{"iso_abbr":"TZ","languages":["sw","en"],"name":"Tanzania"},{"iso_abbr":"TH","languages":["th"],"name":"Thailand"},{"iso_abbr":"TG","languages":["fr"],"name":"Togo"},{"iso_abbr":"TO","languages":["en"],"name":"Tonga"},{"iso_abbr":"TT","languages":["en"],"name":"Trinidad and Tobago"},{"iso_abbr":"TN","languages":["ar","fr"],"name":"Tunisia"},{"iso_abbr":"TR","languages":["tr"],"name":"Turkey"},{"iso_abbr":"TM","languages":["tk","ru"],"name":"Turkmenistan"},{"iso_abbr":"TV","languages":["en"],"name":"Tuvalu"},{"iso_abbr":"UG","languages":["en","sw"],"name":"Uganda"},{"iso_abbr":"UA","languages":["uk","ru"],"name":"Ukraine"},{"iso_abbr":"AE","languages":["ar"],"name":"United Arab Emirates"},{"iso_abbr":"GB","languages":["en"],"name":"United Kingdom"},{"iso_abbr":"US","languages":["en","es","nv","ch","fr","sm"],"name":"United States"},{"iso_abbr":"UY","languages":["es"],"name":"Uruguay"},{"iso_abbr":"UZ","languages":["uz","ru"],"name":"Uzbekistan"},{"iso_abbr":"VU","languages":["bi","en","fr"],"name":"Vanuatu"},{"iso_abbr":"VA","languages":["it"],"name":"Vatican City"},{"iso_abbr":"VE","languages":["es"],"name":"Venezuela"},{"iso_abbr":"VN","languages":["vi"],"name":"Vietnam"},{"iso_abbr":"YE","languages":["ar"],"name":"Yemen"},{"iso_abbr":"ZM","languages":["en"],"name":"Zambia"}]'''

COUNTRIES_MAP_NAME2ISO = {}
COUNTRIES_MAP_ISO2NAME = {}
COUNTRIES_RAW = json.loads(COUNTRIES)
for c in COUNTRIES_RAW:
    COUNTRIES_MAP_NAME2ISO[c['name']] = c['iso_abbr']
    COUNTRIES_MAP_ISO2NAME[c['iso_abbr']] = c['name']

GOOGLE_PUBLIC_API_KEY = os.getenv('GOOGLE_PUBLIC_API_KEY', '')
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')

EMAIL_CONFIG = {
    'FONT_STYLE': 'font-family:Helvetica,Tahoma,Arial,Verdana;font-size:13px;text-align:left;',
}

LIST_OF_ADMIN_PERMISSIONS = {
    'amit.nair@artofliving.org': {
        'countries': ['US', 'CA'],
        'report_permissions': [
            'ttc_applicants_summary.html',
            'post_sahaj_ttc_course_feedback_summary.html',
            'admin_settings.html',
            'ttc_applicants_integrity.html',
        ],
    }, 
    'n84.amit@gmail.com': {
        'countries': ['US'],
        'report_permissions': [
            'ttc_applicants_summary.html',
            'post_ttc_course_feedback_summary.html',
            'post_sahaj_ttc_course_feedback_summary.html',
            'ttc_applicants_reports.html',
            'admin_settings.html',
            'ttc_applicants_integrity.html',
        ],
    },
    'akshay.ponda@artofliving.org': {
        'countries': ['US'],
        'report_permissions': [
            'ttc_applicants_summary.html',
            'post_ttc_course_feedback_summary.html',
            'post_sahaj_ttc_course_feedback_summary.html',
            'ttc_applicants_reports.html',
            'admin_settings.html',
            'ttc_applicants_integrity.html',
        ],
    },
    'ttc@artofliving.org': {
        'countries': ['US'],
        'report_permissions': [
            'ttc_applicants_summary.html',
            'post_ttc_course_feedback_summary.html',
            'ttc_applicants_reports.html',
            'admin_settings.html',
        ],
    },
    'madhuri.karode@artofliving.org': {
        'countries': ['US'],
        'report_permissions': [
            'ttc_applicants_summary.html',
            'post_ttc_course_feedback_summary.html',
            'post_sahaj_ttc_course_feedback_summary.html',
        ],
    },
    'ralph.matta@artofliving.ca': {
        'countries': ['CA'],
        'report_permissions': [
            'ttc_applicants_reports.html',
            'post_ttc_course_feedback_summary.html',
        ],
    }, 
    'ttcdesk@artofliving.ca': {
        'countries': ['CA'],
        'report_permissions': [
            'ttc_applicants_reports.html',
            'post_ttc_course_feedback_summary.html',
        ],
    }, 
    'pooja.tolani@artofliving.ca': {
        'countries': ['CA'],
        'report_permissions': [
            'ttc_applicants_reports.html',
            'post_ttc_course_feedback_summary.html',
        ],
    }, 
    'bhavesh.tolani@artofliving.ca': {
        'countries': ['CA'],
        'report_permissions': [
            'ttc_applicants_reports.html',
            'post_ttc_course_feedback_summary.html',
        ],
    }, 
    'nikita.lomis@artofliving.ca': {
        'countries': ['CA'],
        'report_permissions': [
            'ttc_applicants_reports.html',
            'post_ttc_course_feedback_summary.html',
        ],
    }, 
    'sahajttc@artofliving.org': {
        'countries': ['US'],
        'report_permissions': [
            'post_sahaj_ttc_course_feedback_summary.html',
        ],
    },
    'satish.ahuja@gmail.com': {
        'countries': ['US', 'CA', 'IN'],
        'report_permissions': [
            'ttc_applicants_summary.html',
            'post_ttc_course_feedback_summary.html',
            'post_sahaj_ttc_course_feedback_summary.html',
            'ttc_applicants_reports.html',
            'admin_settings.html',
        ],
    },
    'tulasi.perry@artofliving.org': {
        'countries': ['US'],
        'report_permissions': [
            'post_sahaj_ttc_course_feedback_summary.html',
        ],
    },
    'ttp@in.artofliving.org': {
        'countries': ['IN'],
        'report_permissions': [
            'ttc_applicants_reports.html',
        ],
    },
    'admin.ttp@in.artofliving.org': {
        'countries': ['IN'],
        'report_permissions': [
            'ttc_applicants_reports.html',
        ],
    },
    'sushil.nachnani@artofliving.org': {
        'countries': ['IN'],
        'report_permissions': [
            'ttc_applicants_reports.html',
        ],
    },
    'jani@artofliving.org': {
        'countries': ['IN'],
        'report_permissions': [
            'ttc_applicants_reports.html',
        ],
    },
    'ashish.shah@artofliving.org': {
        'countries': ['IN'],
        'report_permissions': [
            'ttc_applicants_reports.html',
        ],
    },
}

LIST_OF_ADMINS = LIST_OF_ADMIN_PERMISSIONS.keys()
