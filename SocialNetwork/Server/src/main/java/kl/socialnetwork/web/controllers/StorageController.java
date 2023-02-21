package kl.socialnetwork.web.controllers;


import kl.socialnetwork.validations.serviceValidation.services.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

@RestController
@RequestMapping(value = "/storage")
public class StorageController {
    @Autowired
    StorageService storageService;


    @PostMapping(path ="/upload", consumes = {MULTIPART_FORM_DATA_VALUE})
    public ResponseEntity<?>uploadMultiFile(@RequestParam (required = false,value = "file") MultipartFile []file){
        List<String> url = storageService.uploadFile(file);
        return new ResponseEntity<>(url, HttpStatus.OK);
    }


    @GetMapping("/post-image/{filename:.+}")
    @ResponseBody
    public ResponseEntity<?> load(@PathVariable String filename) {
        try {
            Resource file = storageService.loadFile(filename);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                    .contentLength(file.getFile().length())
                    .contentType(MediaType.parseMediaType("application/octet-stream"))
                    .body(file);
        } catch (Exception e) {
            String message = "Could not upload the file: " + filename + "!";
            return ResponseEntity.status(HttpStatus.EXPECTATION_FAILED).body(message);
        }
    }
}
