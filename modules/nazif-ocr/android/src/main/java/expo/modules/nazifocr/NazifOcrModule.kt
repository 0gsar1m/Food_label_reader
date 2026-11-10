package expo.modules.nazifocr

import android.net.Uri
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class NazifOcrModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("NazifOcr")

    AsyncFunction("recognize") { location: String, promise: Promise ->
      val context = checkNotNull(appContext.reactContext)
      val uri = Uri.parse(location)
      require(uri.scheme == "file")
      val image = InputImage.fromFilePath(context, uri)
      val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
      recognizer.process(image)
        .addOnSuccessListener { result -> promise.resolve(result.text) }
        .addOnFailureListener { error -> promise.reject("OCR_FAILED", "Could not read image.", error) }
        .addOnCompleteListener { recognizer.close() }
    }
  }
}
