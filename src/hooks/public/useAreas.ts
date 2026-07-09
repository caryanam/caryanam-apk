import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ENV } from "../../utils/env";

const FALLBACK_AREAS = [
  "A.R. Shala", "AFMC", "Airport", "Akurdi", "Alandi Devachi", "Ambarvet", "Ambegaon BK", "Ammunition Factory Khadki", "Anandnagar", "Armament", "Aundh", "Aundh Camp", "Aundh Camp (Pimple Gurav side)", "Bajirao Road", "Baner Gaon (NIA)", "Baner Road", "Baner Road (NCL)", "Bhatnagar", "Bhavani Peth", "Bhosari", "Bhosari I.E. (MIDC)", "Bhosarigaon", "Bhugaon", "Bhukum", "Bhusari Colony", "Bibvewadi", "Bopkhel", "Botanical Garden", "Botanical Garden (Khadki area)", "C.D.A. (O)", "Charholi Budruk", "Chikhali", "Chimbali", "Chimbli", "Chinchwad (Main)", "Chinchwad East", "Chinchwadgaon", "COD Dehu Road", "College of Military Engineering", "Congress House Road", "Dapodi", "Dapodi Bazar", "Deccan Gymkhana", "Dehu Road Cantonment", "Dhankawadi", "Dhanori", "Dhayari", "Dighi Camp", "Dr. B.A. Chowk", "Dukirkline", "Ex-Serviceman Colony", "Film Institute", "Ganeshkhind", "Ghorpade Peth", "Ghorpuri Bazar", "Govt. Polytechnic", "Guruwar Peth", "H.E. Factory", "Hadapsar", "Hadapsar I.E.", "Hinjewadi Phase 1 (IT Park)", "Hinjewadi Phase 2 (IT Park)", "Hinjewadi Phase 3 (IT Park)", "IAF Station", "Indrayani Nagar", "Jadhavwadi", "Jambhe", "Kalewadi", "Karve Nagar", "Kasarwadi", "Kasba Peth", "Katraj", "Khadakwasla", "Khadki", "Khadki Bazar", "Kharadi", "Khondhwa KH", "Kiwale", "Kondhwa BK", "Kondhwa LH", "Kothrud", "Lohegaon", "Lokmanyanagar", "M. Phulenagar", "Mahatma Phulenagar", "Mangalwar Peth", "Market Yard", "Marunji", "Masulkar Colony", "Model Colony", "Mohammadwadi", "Morwadi", "Moshi", "N.I.B.M.", "N.W. College", "Nana Peth", "Nanded", "Nanded City", "Narayan Peth", "Navsahyadri", "NDA Khadakwasla", "Nehru Nagar", "Nigdi Pradhikaran (PCNT)", "Ordnance Factory Dehu Road", "P.C.N.T.", "Parvati", "Parvati Gaon", "PCMC HQ Area", "Pimple Gurav", "Pimple Nilakh", "Pimple Saudagar", "Pimpri (Main)", "Pimpri Colony", "Pimpri P.F.", "Pimpri Waghire", "Punawale", "Pune Cantt East", "Pune City H.O.", "Pune H.O. (Main GPO)", "Pune New Bazar", "Rahatani", "Range Hills", "Rashtra Bhasha Bhavan", "Rasta Peth", "Ravet", "Raviwar Peth", "Rupeenagar", "S.P. College", "S.S.C. Exam Board", "Sachapir Street", "Sadashiv Peth", "Salisbury Park", "Salumbre", "Sambhaji nagar", "Sangvi", "Sasane Nagar", "Sector 27 Pradhikaran", "Sector 29", "Shaniwar Peth", "Shivaji Housing Society", "Shivajinagar", "Shukrawar Peth", "Spine Road Area", "SRPF Camp", "Sus", "Swargate", "T.V. Nagar", "Talwade (IT Park)", "Talwade MIDC", "Tathawade", "Thergaon", "Vadgaon Budruk", "Vadgaon Sheri", "Vidyanagar", "Viman Nagar", "Vishrantwadi", "Wakad", "Wanowrie", "Warje", "Yamunanagar", "Yamunanagar (Nigdi)", "Yerwada"
];

export function useAreas() {
  return useQuery<string[]>({
    queryKey: ["all-areas"],
    queryFn: async () => {
      try {
        const { data } = await axios.get(`${ENV.API_BASE_URL}/api/pincode/all-areas`);
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
        return FALLBACK_AREAS;
      } catch (error) {
        console.warn("Failed to fetch areas from API, using fallback data");
        return FALLBACK_AREAS;
      }
    },
    staleTime: 1000 * 60 * 10,
    initialData: FALLBACK_AREAS,
  });
}
