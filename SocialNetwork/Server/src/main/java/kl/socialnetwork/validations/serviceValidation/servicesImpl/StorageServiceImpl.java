package kl.socialnetwork.validations.serviceValidation.servicesImpl;

import kl.socialnetwork.utils.responseHandler.exceptions.StorageException;
import kl.socialnetwork.validations.serviceValidation.services.StorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Service
public class StorageServiceImpl implements StorageService {

    @Value("${upload.path}")
    private String folder;

    @Override
    public List<String> uploadFile(MultipartFile[] files) {
        List<String> paths = new ArrayList<>();

        if(files.length==0){
            return paths;
        }

        for(MultipartFile file:files){
            Date date = new Date();
            String fileName = date.getTime() + "-" + file.getOriginalFilename();

            if (file.isEmpty()) {
                throw new StorageException("Failed to store empty file");
            }

            try {
                var is = file.getInputStream();
                Files.copy(is, Paths.get(folder + fileName),
                        StandardCopyOption.REPLACE_EXISTING);

                paths.add(fileName);
            } catch (IOException e) {
                var msg = String.format("Failed to store file %f", file.getName());
                throw new StorageException(msg, e);
            }
        }






        return paths;
    }
}

