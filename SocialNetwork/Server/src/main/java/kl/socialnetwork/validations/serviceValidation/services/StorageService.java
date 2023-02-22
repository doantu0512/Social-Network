package kl.socialnetwork.validations.serviceValidation.services;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface StorageService {
    List<String> uploadFile(MultipartFile[] file);
    Resource loadFile(String filename);

}
