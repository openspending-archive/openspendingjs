/*! openspending.icons.js - Icons for OpenSpending
 * ------------------------------------------------------------------------
 *
 * Copyright 2013 Open Knowledge Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Define OpenSpending object (if used as a separate module)
var OpenSpending = OpenSpending || {};

// Define Icons property
OpenSpending.Icons = OpenSpending.Icons || {};

// Cofog1 icons
OpenSpending.Icons.Cofog1 = {    
    '01': 'government-uk.svg',
    '02': 'defence.svg',
    '03': 'order-safety.svg',
    '04': 'social-systems.svg',
    '05': 'environment.svg',
    '06': 'our-streets.svg',
    '07': 'health.svg',
    '08': 'culture.svg',
    '09': 'schools.svg',
    '10': 'helping-others.svg',
};

// Cofog 2 icons
OpenSpending.Icons.Cofog2 = {
    '01.1': 'legislative.svg',
    '01.2': 'aid.svg',
    '01.3': 'misc-services.svg',
    '01.4': 'research.svg',
    '01.6': 'unemployment.svg', // Borrowing an icon
    '01.7': 'public-debt.svg',
    '01.8': 'economic-aid.svg',

    '02.1': 'military.svg' ,
    '02.2': 'civil-defence.svg' ,
    '02.3': 'foreign-military-aid.svg' ,
    '02.4': 'defence-research.svg' ,
    '02.5': 'defence-admin.svg' ,
    
    '03.1': 'police.svg' ,
    '03.2': 'fire-brigade.svg' ,
    '03.3': 'courts.svg' ,
    '03.4': 'prisons.svg' ,
    '03.5': 'rd-order-safety.svg' ,
    '03.6': 'admin-order-safety.svg' ,
    
    '04.1': 'social-systems.svg',
    '04.2': 'farms.svg',
    '04.3': 'energy.svg',
    '04.4': 'manufactoring-construction.svg',
    '04.5': 'transport.svg',
    '04.6': 'communication.svg',
    '04.7': 'misc-services.svg',
    '04.8': 'research.svg',
    '04.9': 'money.svg',
    
    '05.1': 'waste.svg' ,
    '05.2': 'toilet.svg' ,
    '05.3': 'pollution.svg' ,
    '05.4': 'tree.svg' ,
    '05.6': 'environment-admin.svg' ,
    
    '06.1': 'housing.svg' ,		
    '06.2': 'community.svg' ,
    '06.3': 'water.svg' ,
    '06.4': 'street-lights.svg' ,
    
    '07.2': 'health.svg',
    '07.3': 'hospital.svg',
    '07.5': 'research.svg',
    '07.6': 'other-medical.svg',

    '08.2': 'culture.svg',					
    '08.1': 'sports.svg',	
    '08.3': 'media.svg',
    '08.6': 'admin-culture.svg',

    '09.1': 'secondary-lower.svg',
    '09.2': 'post-secondary.svg',
    '09.4': 'education.svg',
    '09.6': 'research.svg',
    '09.8': 'admin.svg',
    
    '10.1': 'helping-others.svg',
    '10.2': 'old-age.svg',
    '10.4': 'family.svg',
    '10.5': 'unemployment.svg',
    '10.7': 'family2.svg',
    '10.9': 'admin.svg'
};

// Cofog 3 icons
OpenSpending.Icons.Cofog3 = {
    '01.1.1': 'legislative.svg' ,
    '01.1.2': 'pig.svg' ,
    '01.1.3': 'worldmap.svg' ,
    '01.2.1': 'aid-developing-countries.svg' ,
    '01.2.2': 'economic-aid.svg' ,
    '01.3.1': 'human-resources.svg' ,
    '01.3.2': 'planning.svg' ,
    '01.3.3': 'research.svg' ,

    '03.1.0': 'police.svg',
    '03.3.0': 'courts.svg',    
    '03.6.0': 'admin-order-safety.svg',

    '04.1.1': 'social-systems.svg' ,
    '04.1.2': 'labour.svg' ,					
    '04.2.1': 'farms.svg' ,
    '04.2.2': 'forest.svg' ,
    '04.2.3': 'fishing.svg' ,				
    '04.3.1': 'coal.svg' ,
    '04.3.2': 'petrol.svg' ,
    '04.3.3': 'nuclear.svg' ,
    '04.3.4': 'fuel.svg' ,
    '04.3.5': 'electricity.svg' ,
    '04.3.6': 'wind.svg' ,
    '04.5.1': 'car.svg' ,
    '04.5.2': 'anchor.svg' ,
    '04.5.3': 'railways.svg' ,
    '04.5.4': 'airplane.svg' ,
    '04.8.4': 'coal.svg',
    '04.9.0': 'financial-admin.svg',

    '06.1.0': 'housing.svg',
    '06.3.0': 'water.svg',
    
    '07.1.1': 'medical-supplies.svg' ,				
    '07.1.2': 'other-medical-products.svg' ,				
    '07.1.3': 'wheelchair.svg' ,		
    '07.2.1': 'health.svg' ,
    '07.2.2': 'microscope.svg' ,
    '07.2.2': 'dental.svg' ,
    '07.3.1': 'hospital.svg' ,
    '07.3.2': 'hospital-specialized.svg' ,
    '07.3.2': 'dental.svg' ,

    '09.1.1': 'pre-school.svg',
    '09.1.2': 'primary.svg',
    
    '10.1.2': 'helping-others.svg',
    '10.2.0': 'old-age.svg',
    '10.5.0': 'unemployment.svg'
};

// Join all levels into one cofog icon object
OpenSpending.Icons.Cofog = jQuery.extend({},
				         OpenSpending.Icons.Cofog1,
					 OpenSpending.Icons.Cofog2,
					 OpenSpending.Icons.Cofog3
				   	);

// Create a function and attach it to the one cofog icon object
OpenSpending.Icons.Cofog.getIcon = function(code, prepend_text) {
    if (typeof code == 'string') {
        // Replace anything that is not a digit with a dot
        var key = code.replace(/(\D)/g, '.')
        // Add prepended text or nothing to the icon lookup (or unknown)
        return (prepend_text || '') + (this[key] || 'unknown.svg');
    }
    return prepend_text || '' + 'unknown.svg';
};
